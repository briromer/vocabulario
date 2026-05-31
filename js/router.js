// js/router.js
import { store }              from './store.js';
import { WORDS }              from './words.js';
import { Session }            from './session.js';
import { scoreCard }          from './srs.js';
import { render as renderType }       from './modes/type.js';
import { render as renderFlashcard }  from './modes/flashcard.js';
import { render as renderMC }         from './modes/multiple-choice.js';

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
  }

  go(screen, params = {}) {
    switch (screen) {
      case 'home':        return this._showHome();
      case 'mode-select': return this._showModeSelect();
      case 'study':       return this._showStudy(params.mode);
      case 'session-end': return this._showSessionEnd();
      case 'stats':       return this._showStats();
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
        <button class="btn btn-secondary" id="btn-stats">Stats</button>
      </header>

      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${WORDS.length}</div>
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
        ${Object.keys(allCards).length} of ${WORDS.length} words reviewed
      </p>
    `;

    this._root.querySelector('#btn-start').addEventListener('click', () => this.go('mode-select'));
    this._root.querySelector('#btn-stats').addEventListener('click', () => this.go('stats'));
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

  _showStudy(mode) {
    this._mode = mode;
    const allCards = store.getAllCards();
    this._session = new Session({ allCards, words: WORDS });

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
    });
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
}
