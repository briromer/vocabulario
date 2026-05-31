// js/router.js
import { store }              from './store.js';
import { WORDS }              from './words.js';
import { Session }            from './session.js';
import { scoreCard }          from './srs.js';
import { render as renderType }       from './modes/type.js';
import { render as renderFlashcard }  from './modes/flashcard.js';
import { render as renderMC }         from './modes/multiple-choice.js';
import { getSheetId, saveSheetId } from './config.js';
import { loadSheetWords, clearSheetCache } from './sheets.js';

const MODE_RENDERERS = {
  type:      renderType,
  flashcard: renderFlashcard,
  choice:    renderMC,
};

export class Router {
  constructor(root) {
    this._root = root;
    this._session = null;
    this._mode = null;
    this._words = WORDS; // fallback until sheet loads
  }

  go(screen, params = {}) {
    switch (screen) {
      case 'home':        return this._showHome();
      case 'mode-select': return this._showModeSelect();
      case 'study':       return this._showStudy(params.mode);
      case 'session-end': return this._showSessionEnd();
      case 'stats':       return this._showStats();
      case 'settings':    return this._showSettings();
    }
  }

  _showHome() {
    const allCards = store.getAllCards();
    const sessions = store.getSessions();
    const totalReviewed = Object.values(allCards).reduce((s, c) => s + c.totalReviews, 0);
    const totalCorrect  = Object.values(allCards).reduce((s, c) => s + c.totalCorrect, 0);
    const accuracy = totalReviewed > 0 ? Math.round(totalCorrect / totalReviewed * 100) : 0;

    this._root.innerHTML = `
      <header class="app-header">
        <h1>Vocabulario</h1>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" id="btn-stats">Stats</button>
          <button class="btn btn-secondary" id="btn-settings" title="Settings">⚙</button>
        </div>
      </header>

      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${this._words.length}</div>
          <div class="stat-label">Words</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${sessions.length}</div>
          <div class="stat-label">Sessions</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
      </div>

      <button class="btn btn-primary btn-full" id="btn-start" style="padding:18px;font-size:1.1rem">
        Study Now
      </button>

      <p class="muted" style="text-align:center">
        ${Object.keys(allCards).length} of ${this._words.length} words reviewed
      </p>
    `;

    this._root.querySelector('#btn-start').addEventListener('click', () => this.go('mode-select'));
    this._root.querySelector('#btn-stats').addEventListener('click', () => this.go('stats'));
    this._root.querySelector('#btn-settings').addEventListener('click', () => this.go('settings'));
  }

  _showModeSelect() {
    this._root.innerHTML = `
      <header class="app-header">
        <button class="btn btn-secondary" id="btn-back">← Back</button>
        <h2 style="flex:1;text-align:center">Choose Mode</h2>
        <div style="width:64px"></div>
      </header>

      <div class="mode-grid">
        <button class="mode-card" data-mode="type">
          <div class="mode-icon">⌨️</div>
          <h3>Type the Answer</h3>
          <p class="muted">See Spanish, type the English meaning. Hard mode — tests active recall.</p>
        </button>
        <button class="mode-card" data-mode="flashcard">
          <div class="mode-icon">🃏</div>
          <h3>Flashcard Flip</h3>
          <p class="muted">Click to reveal the translation. Self-mark right or wrong.</p>
        </button>
        <button class="mode-card" data-mode="choice">
          <div class="mode-icon">🎯</div>
          <h3>Multiple Choice</h3>
          <p class="muted">Pick the correct English meaning from four options.</p>
        </button>
      </div>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));
    this._root.querySelectorAll('.mode-card').forEach(btn => {
      btn.addEventListener('click', () => this.go('study', { mode: btn.dataset.mode }));
    });
  }

  async _showStudy(mode) {
    this._mode = mode;

    this._root.innerHTML = `<div style="text-align:center;padding:60px 0"><p class="muted">Loading vocabulary…</p></div>`;
    try {
      this._words = await loadSheetWords();
    } catch (err) {
      // Keep existing this._words (demo or last successful load) and continue
      console.warn('Sheet load failed, using cached/demo words:', err.message);
    }

    const allCards = store.getAllCards();
    this._session = new Session({ allCards, words: this._words });

    if (this._session.total() === 0) {
      this._root.innerHTML = `
        <div style="text-align:center;padding:60px 0">
          <div style="font-size:3rem;margin-bottom:16px">✅</div>
          <h2>All caught up!</h2>
          <p class="muted" style="margin:12px 0 24px">No cards are due today. Check back tomorrow.</p>
          <button class="btn btn-secondary" id="btn-home">Home</button>
        </div>
      `;
      this._root.querySelector('#btn-home').addEventListener('click', () => this.go('home'));
      return;
    }

    this._nextCard();
  }

  _nextCard() {
    const card = this._session.nextCard();
    if (!card) {
      this._endSession();
      return;
    }
    this._renderCard(card);
  }

  _renderCard(card) {
    const total     = this._session.total();
    const remaining = this._session.remaining();
    const done = total - remaining;
    const pct  = total > 0 ? Math.round(done / total * 100) : 0;

    this._root.innerHTML = `
      <header class="app-header">
        <button class="btn btn-secondary" id="btn-quit">✕</button>
        <div style="flex:1;padding:0 16px">
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
          <p class="muted" style="text-align:center;margin-top:4px;font-size:0.8rem">
            ${done} / ${total}
          </p>
        </div>
        <div style="width:40px;text-align:right;font-size:0.9rem;color:var(--success)">
          ${this._session.correctCount()}✓
        </div>
      </header>

      <div id="mode-container"></div>
    `;

    this._root.querySelector('#btn-quit').addEventListener('click', () => this.go('home'));

    const modeContainer = this._root.querySelector('#mode-container');
    const renderer = MODE_RENDERERS[this._mode];
    let resultRecorded = false;

    renderer(modeContainer, card, ({ correct, advance }) => {
      if (!resultRecorded) {
        resultRecorded = true;
        this._session.recordResult(correct);
        const cardState = store.getOrCreateCard(card.wordId);
        const updated = scoreCard(cardState, correct);
        store.saveCard(updated);
      }
      if (advance) this._nextCard();
    }, this._words);
  }

  _endSession() {
    const record = this._session.toSessionRecord(this._mode);
    store.saveSession(record);
    this.go('session-end');
  }

  _showSessionEnd() {
    const session = this._session;
    const correct = session.correctCount();
    const total   = session.total();
    const pct     = total > 0 ? Math.round(correct / total * 100) : 0;

    this._root.innerHTML = `
      <div style="text-align:center;padding:40px 0">
        <div style="font-size:4rem;margin-bottom:16px">${pct >= 70 ? '🎉' : '💪'}</div>
        <h2>Session Complete</h2>
        <p class="muted" style="margin:8px 0 24px">You got ${correct} of ${total} correct</p>

        <div class="stat-grid" style="margin-bottom:24px">
          <div class="stat-box">
            <div class="stat-value">${correct}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${total - correct}</div>
            <div class="stat-label">Missed</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${pct}%</div>
            <div class="stat-label">Score</div>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-direction:column">
          <button class="btn btn-primary btn-full" id="btn-again">Study Again</button>
          <button class="btn btn-secondary btn-full" id="btn-home">Home</button>
        </div>
      </div>
    `;

    this._root.querySelector('#btn-again').addEventListener('click', () => this.go('mode-select'));
    this._root.querySelector('#btn-home').addEventListener('click',  () => this.go('home'));
  }

  _showStats() {
    const allCards = store.getAllCards();
    const sessions = store.getSessions();

    const totalReviewed = Object.values(allCards).reduce((s, c) => s + c.totalReviews, 0);
    const totalCorrect  = Object.values(allCards).reduce((s, c) => s + c.totalCorrect, 0);
    const accuracy = totalReviewed > 0 ? Math.round(totalCorrect / totalReviewed * 100) : 0;

    const dates = [...new Set(sessions.map(s => s.date))].sort();
    let streak = 0;
    if (dates.length > 0) {
      let d = new Date(new Date().toISOString().slice(0, 10) + 'T12:00:00Z');
      for (let i = 0; i < 365; i++) {
        const str = d.toISOString().slice(0, 10);
        if (dates.includes(str)) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
        else break;
      }
    }

    const recentSessions = [...sessions].reverse().slice(0, 5);

    this._root.innerHTML = `
      <header class="app-header">
        <button class="btn btn-secondary" id="btn-back">← Back</button>
        <h2 style="flex:1;text-align:center">Statistics</h2>
        <div style="width:64px"></div>
      </header>

      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Day Streak</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">Overall Accuracy</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${sessions.length}</div>
          <div class="stat-label">Sessions</div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom:12px">Recent Sessions</h3>
        ${recentSessions.length === 0
          ? '<p class="muted">No sessions yet.</p>'
          : recentSessions.map(s => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
                <div>
                  <span class="tag">${s.mode}</span>
                  <span class="muted" style="margin-left:8px">${s.date}</span>
                </div>
                <div style="color:var(--success);font-weight:700">
                  ${s.correctCount}/${s.totalCards}
                </div>
              </div>
            `).join('')
        }
      </div>

      <button class="btn btn-secondary btn-full" id="btn-reset"
        style="border-color:var(--error);color:var(--error)">
        Reset All Progress
      </button>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));
    this._root.querySelector('#btn-reset').addEventListener('click', () => {
      if (confirm('Reset ALL progress? This cannot be undone.')) {
        store.clear();
        this.go('home');
      }
    });
  }

  _showSettings() {
    const sheetId = getSheetId();

    this._root.innerHTML = `
      <header class="app-header">
        <button class="btn btn-secondary" id="btn-back">← Back</button>
        <h2 style="flex:1;text-align:center">Settings</h2>
        <div style="width:64px"></div>
      </header>

      <div class="card" style="display:flex;flex-direction:column;gap:16px">
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--muted);margin-bottom:6px">
            Google Sheet ID
          </label>
          <input
            id="inp-sheetid"
            class="input"
            type="text"
            value="${sheetId}"
            autocomplete="off"
          />
          <p class="muted" style="font-size:0.78rem;margin-top:4px">
            From the sheet URL: /spreadsheets/d/<strong>SHEET_ID</strong>/edit. Sheet must be set to "Anyone with the link can view".
          </p>
        </div>

        <p class="muted" style="font-size:0.78rem">
          Columns: A = Spanish, B = English, C = part of speech (optional), D = example sentence (optional). Row 1 is the header and is skipped.
        </p>

        <button class="btn btn-primary btn-full" id="btn-save">Save &amp; Test</button>
        <button class="btn btn-secondary btn-full" id="btn-clear-cache">Clear Vocabulary Cache</button>
        <div id="settings-msg" style="display:none;font-size:0.9rem;text-align:center;padding:8px 0"></div>
      </div>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));

    this._root.querySelector('#btn-save').addEventListener('click', async () => {
      const newSheetId = this._root.querySelector('#inp-sheetid').value.trim();
      const msg = this._root.querySelector('#settings-msg');

      saveSheetId(newSheetId);
      clearSheetCache();

      msg.style.display = 'block';
      msg.style.color = 'var(--muted)';
      msg.textContent = 'Testing connection…';
      try {
        const words = await loadSheetWords();
        this._words = words;
        msg.style.color = 'var(--success)';
        msg.textContent = `Connected! ${words.length} words loaded.`;
      } catch (err) {
        msg.style.color = 'var(--error)';
        msg.textContent = `Error: ${err.message}`;
      }
    });

    this._root.querySelector('#btn-clear-cache').addEventListener('click', () => {
      clearSheetCache();
      const msg = this._root.querySelector('#settings-msg');
      msg.style.display = 'block';
      msg.style.color = 'var(--muted)';
      msg.textContent = 'Cache cleared. Next session will re-fetch from sheet.';
    });
  }
}
