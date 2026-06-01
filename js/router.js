// js/router.js
import { store }              from './store.js';
import { WORDS }              from './words.js';
import { Session }            from './session.js';
import { scoreCard }          from './srs.js';
import { render as renderType }       from './modes/type.js';
import { render as renderFlashcard }  from './modes/flashcard.js';
import { render as renderMC }         from './modes/multiple-choice.js';
import { getSheetId, saveSheetId, getSessionSize, saveSessionSize } from './config.js';
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
    this._lastPct = 0;
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
    const allCards    = store.getAllCards();
    const sessions    = store.getSessions();
    const totalReviewed = Object.values(allCards).reduce((s, c) => s + c.totalReviews, 0);
    const totalCorrect  = Object.values(allCards).reduce((s, c) => s + c.totalCorrect, 0);
    const accuracy      = totalReviewed > 0 ? Math.round(totalCorrect / totalReviewed * 100) : 0;

    const hour = new Date().getHours();
    const greeting = hour < 5 ? 'Aún despierto' : hour < 12 ? 'Buen día' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
    const todayStr     = new Date().toISOString().slice(0, 10);
    const reviewedCount = Object.keys(allCards).length;
    const dueCount     = Object.values(allCards).filter(c => c.dueDate <= todayStr).length;
    const newCount     = this._words.filter(w => !allCards[w.id]).length;
    const readyCount   = Math.min(dueCount + newCount, getSessionSize());
    const reviewedPct  = this._words.length > 0 ? Math.round(reviewedCount / this._words.length * 100) : 0;

    this._root.innerHTML = `
      <header class="app-header">
        <div>
          <h1>Vocabulario</h1>
          <p class="muted" style="font-size:0.78rem;font-style:italic;margin-top:2px">Cien años de soledad &nbsp;·&nbsp; ${greeting}</p>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn btn-secondary" id="btn-stats" style="font-size:0.85rem;padding:9px 16px">Stats</button>
          <button class="btn-icon" id="btn-settings" title="Settings">⚙</button>
        </div>
      </header>

      <div class="home-stats-card">
        <div class="home-stat">
          <span class="home-stat-value">${this._words.length}</span>
          <span class="home-stat-label">words</span>
        </div>
        <div class="home-stat">
          <span class="home-stat-value">${sessions.length}</span>
          <span class="home-stat-label">sessions</span>
        </div>
        <div class="home-stat">
          <span class="home-stat-value">${accuracy}%</span>
          <span class="home-stat-label">accuracy</span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <button class="btn btn-primary btn-full" id="btn-start" style="padding:20px;font-size:1.1rem">
          Study Now
        </button>
        <div>
          <p class="muted" style="text-align:center;font-size:0.82rem;margin-bottom:10px">
            ${readyCount} card${readyCount !== 1 ? 's' : ''} ready
          </p>
          <div class="progress-bar" style="height:3px;margin-bottom:7px">
            <div class="progress-bar-fill" id="home-progress" style="width:0%"></div>
          </div>
          <p class="muted" style="text-align:center;font-size:0.75rem">
            ${reviewedCount} of ${this._words.length} words reviewed
          </p>
        </div>
      </div>
    `;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bar = this._root.querySelector('#home-progress');
      if (bar) bar.style.width = `${reviewedPct}%`;
    }));

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

      <div class="mode-list">
        <button class="mode-item" data-mode="type">
          <div class="mode-item-body">
            <span class="mode-item-name">Type the Answer</span>
            <span class="mode-item-desc">See Spanish, type English. Active recall — the hardest mode.</span>
          </div>
          <span class="mode-item-arrow">→</span>
        </button>
        <button class="mode-item" data-mode="flashcard">
          <div class="mode-item-body">
            <span class="mode-item-name">Flashcard</span>
            <span class="mode-item-desc">Flip to reveal the translation. Self-mark right or wrong.</span>
          </div>
          <span class="mode-item-arrow">→</span>
        </button>
        <button class="mode-item" data-mode="choice">
          <div class="mode-item-body">
            <span class="mode-item-name">Multiple Choice</span>
            <span class="mode-item-desc">Pick the correct English meaning from four options.</span>
          </div>
          <span class="mode-item-arrow">→</span>
        </button>
      </div>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));
    this._root.querySelectorAll('.mode-item').forEach(btn => {
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

    this._lastPct = 0;
    const allCards = store.getAllCards();
    this._session = new Session({ allCards, words: this._words, sessionSize: getSessionSize() });

    if (this._session.total() === 0) {
      this._root.innerHTML = `
        <div style="text-align:center;padding:60px 0">
          <h2 style="margin-bottom:12px">All caught up</h2>
          <p class="muted" style="margin-bottom:28px;max-width:280px;margin-inline:auto">
            No cards are due. Come back tomorrow to keep your review streak going.
          </p>
          <button class="btn btn-secondary" id="btn-home">← Home</button>
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
      <header class="study-header">
        <button class="btn-icon" id="btn-quit" title="Quit">✕</button>
        <div class="study-progress">
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width:${this._lastPct}%"></div>
          </div>
          <div class="study-meta">
            <span class="muted">${done} of ${total}</span>
            <span style="color:var(--success)">${this._session.correctCount()} correct</span>
          </div>
        </div>
      </header>

      <div id="mode-container"></div>
    `;

    this._root.querySelector('#btn-quit').addEventListener('click', () => this.go('home'));

    const fill = this._root.querySelector('.progress-bar-fill');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.width = `${pct}%`;
      this._lastPct = pct;
    }));

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
    const scoreClass = pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low';
    const sessionLine = pct >= 90 ? 'Buena memoria.'
      : pct >= 70 ? 'Progresando bien.'
      : pct >= 50 ? 'Las palabras se aprenden con paciencia.'
      : 'Vuelve mañana. Las palabras esperan.';

    this._root.innerHTML = `
      <div style="text-align:center;padding:24px 0 0">
        <div class="session-score-hero ${scoreClass}">${pct}%</div>
        <h2 style="margin-bottom:8px">Session done</h2>
        <p class="muted" style="margin-bottom:8px">${correct} of ${total} correct</p>
        <p style="font-family:'DM Serif Display',serif;font-style:italic;font-size:0.95rem;color:var(--muted);margin-bottom:32px">${sessionLine}</p>

        <div class="stat-grid" style="margin-bottom:32px">
          <div class="stat-box">
            <div class="stat-value" style="color:var(--success)">${correct}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color:var(--error)">${total - correct}</div>
            <div class="stat-label">Missed</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Cards</div>
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
        <h3 style="margin-bottom:16px">Recent Sessions</h3>
        ${recentSessions.length === 0
          ? '<p class="muted">No sessions yet.</p>'
          : recentSessions.map(s => {
              const spct = s.totalCards > 0 ? Math.round(s.correctCount / s.totalCards * 100) : 0;
              const modeLabel = { type: 'Type', flashcard: 'Flashcard', choice: 'Choice' }[s.mode] || s.mode;
              return `
              <div class="session-row">
                <div class="session-row-left">
                  <span class="tag">${modeLabel}</span>
                  <span class="muted" style="font-size:0.82rem">${s.date}</span>
                </div>
                <div class="session-row-score" style="color:${spct >= 70 ? 'var(--success)' : 'var(--muted)'}">
                  ${s.correctCount}/${s.totalCards}
                  <span class="muted" style="font-weight:400;font-size:0.8rem;margin-left:4px">${spct}%</span>
                </div>
              </div>`;
            }).join('')
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
    const sessionSize = getSessionSize();

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

        <div>
          <label style="display:block;font-size:0.85rem;color:var(--muted);margin-bottom:6px">
            Cards per session
          </label>
          <input
            id="inp-session-size"
            class="input"
            type="number"
            min="1"
            max="200"
            value="${sessionSize}"
            style="width:120px"
          />
        </div>

        <button class="btn btn-primary btn-full" id="btn-save">Save &amp; Test</button>
        <button class="btn btn-secondary btn-full" id="btn-clear-cache">Clear Vocabulary Cache</button>
        <div id="settings-msg" style="display:none;font-size:0.9rem;text-align:center;padding:8px 0"></div>
      </div>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));

    this._root.querySelector('#btn-save').addEventListener('click', async () => {
      const newSheetId = this._root.querySelector('#inp-sheetid').value.trim();
      const newSize    = this._root.querySelector('#inp-session-size').value;
      const msg = this._root.querySelector('#settings-msg');

      saveSheetId(newSheetId);
      saveSessionSize(newSize);
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
