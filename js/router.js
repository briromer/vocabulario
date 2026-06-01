// js/router.js
import { store }              from './store.js';
import { WORDS }              from './words.js';
import { Session }            from './session.js';
import { scoreCard }          from './srs.js';
import { render as renderType }       from './modes/type.js';
import { render as renderFlashcard }  from './modes/flashcard.js';
import { render as renderMC }         from './modes/multiple-choice.js';
import { getSheetId, saveSheetId, getSessionSize, saveSessionSize, getDirection, saveDirection } from './config.js';
import { loadSheetWords, clearSheetCache } from './sheets.js';
import { lookupSentence } from './word-index.js';

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
    this._direction = 'es-en';
  }

  go(screen, params = {}) {
    switch (screen) {
      case 'home':        return this._showHome();
      case 'mode-select': return this._showModeSelect();
      case 'study':       return this._showStudy(params.mode);
      case 'session-end': return this._showSessionEnd();
      case 'stats':       return this._showStats();
      case 'settings':    return this._showSettings();
      case 'word-list':   return this._showWordList();
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
          <p class="muted" style="font-size:0.82rem;font-family:'EB Garamond',Georgia,serif;font-style:italic;margin-top:4px">Cien años de soledad &nbsp;·&nbsp; ${greeting}</p>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn btn-secondary" id="btn-words" style="font-size:0.85rem;padding:9px 16px">Words</button>
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

      <div style="text-align:center;padding:4px 8px">
        <p style="font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:1.3rem;line-height:1.7;color:var(--text);opacity:0.72;max-width:400px;margin:0 auto">${(q => `«${q}»`)([
          'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.',
          'El secreto de una buena vejez no es otra cosa que un pacto honrado con la soledad.',
          'Las estirpes condenadas a cien años de soledad no tenían una segunda oportunidad sobre la tierra.',
        ][Math.floor(Math.random() * 3)])}</p>
        <p style="font-family:'EB Garamond',Georgia,serif;font-size:0.85rem;color:var(--muted);margin-top:8px">— Gabriel García Márquez</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <button class="btn btn-primary-ghost btn-full" id="btn-start" style="padding:20px;font-size:1.1rem">
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
    this._root.querySelector('#btn-words').addEventListener('click', () => this.go('word-list'));
    this._root.querySelector('#btn-stats').addEventListener('click', () => this.go('stats'));
    this._root.querySelector('#btn-settings').addEventListener('click', () => this.go('settings'));
  }

  _showModeSelect() {
    const direction = getDirection();
    const enEs = direction === 'en-es';

    this._root.innerHTML = `
      <header class="app-header">
        <button class="btn btn-secondary" id="btn-back">← Back</button>
        <h2 style="flex:1;text-align:center">Choose Mode</h2>
        <div style="width:64px"></div>
      </header>

      <div class="dir-toggle">
        <button class="dir-btn ${!enEs ? 'active' : ''}" data-dir="es-en">ES → EN</button>
        <button class="dir-btn ${enEs ? 'active' : ''}" data-dir="en-es">EN → ES</button>
      </div>

      <div class="mode-list">
        <button class="mode-item" data-mode="type">
          <div class="mode-item-body">
            <span class="mode-item-name">Type the Answer</span>
            <span class="mode-item-desc">${enEs ? 'See English, type Spanish.' : 'See Spanish, type English.'} Active recall — the hardest mode.</span>
          </div>
          <span class="mode-item-arrow">→</span>
        </button>
        <button class="mode-item" data-mode="flashcard">
          <div class="mode-item-body">
            <span class="mode-item-name">Flashcard</span>
            <span class="mode-item-desc">${enEs ? 'Flip to reveal the Spanish word.' : 'Flip to reveal the translation.'} Self-mark right or wrong.</span>
          </div>
          <span class="mode-item-arrow">→</span>
        </button>
        <button class="mode-item" data-mode="choice">
          <div class="mode-item-body">
            <span class="mode-item-name">Multiple Choice</span>
            <span class="mode-item-desc">Pick the correct ${enEs ? 'Spanish word' : 'English meaning'} from four options.</span>
          </div>
          <span class="mode-item-arrow">→</span>
        </button>
      </div>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));
    this._root.querySelectorAll('.dir-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        saveDirection(btn.dataset.dir);
        this._showModeSelect();
      });
    });
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
    this._direction = getDirection();
    const allCards = store.getAllCards();
    this._session = new Session({ allCards, words: this._words, sessionSize: getSessionSize() });

    if (this._session.total() === 0) {
      this._root.innerHTML = `
        <div style="text-align:center;padding:60px 0">
          <p style="font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:1.4rem;color:var(--text);margin-bottom:12px">Las palabras esperan.</p>
          <p class="muted" style="margin-bottom:32px;max-width:260px;margin-inline:auto">No hay palabras pendientes. Vuelve mañana.</p>
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
    }, this._words, this._direction);
  }

  _endSession() {
    const record = { ...this._session.toSessionRecord(this._mode), direction: this._direction };
    store.saveSession(record);
    this.go('session-end');
  }

  _showSessionEnd() {
    const session = this._session;
    const correct = session.correctCount();
    const total   = session.total();
    const pct     = total > 0 ? Math.round(correct / total * 100) : 0;
    const scoreClass = pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low';
    const _pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const sessionLine = pct >= 90
      ? _pick(['Buena memoria.', 'Las palabras ya son tuyas.', 'Macondo te pertenece un poco más.'])
      : pct >= 70
      ? _pick(['Progresando bien.', 'El camino se hace al andar.', 'Poco a poco, la aldea cobra forma.'])
      : pct >= 50
      ? _pick(['Las palabras se aprenden con paciencia.', 'Cada error es una palabra que regresa.', 'La memoria necesita tiempo.'])
      : _pick(['Vuelve mañana. Las palabras esperan.', 'El olvido tiene cura: volver a leer.', 'Hasta Úrsula olvidaba.']);

    this._root.innerHTML = `
      <div style="text-align:center;padding:24px 0 0">
        <div class="session-score-hero ${scoreClass}">${pct}%</div>
        <h2 style="margin-bottom:8px">Session done</h2>
        <p class="muted" style="margin-bottom:8px">${correct} of ${total} correct</p>
        <p style="font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:1.05rem;color:var(--muted);margin-bottom:32px">${sessionLine}</p>

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
              const modeLabel = ({ type: 'Type', flashcard: 'Flashcard', choice: 'Choice' }[s.mode] || s.mode)
                + (s.direction === 'en-es' ? ' EN→ES' : '');
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

  async _showWordList() {
    this._root.innerHTML = `<div style="text-align:center;padding:60px 0"><p class="muted">Loading…</p></div>`;

    try { this._words = await loadSheetWords(); } catch { /* use cached */ }

    const allCards = store.getAllCards();
    const today    = new Date().toISOString().slice(0, 10);

    const enriched = this._words.map(w => {
      const card = allCards[w.id];
      let status;
      if (!card || card.totalReviews === 0) status = 'new';
      else if (card.dueDate <= today)       status = 'due';
      else                                  status = 'learned';
      const accuracy = card && card.totalReviews > 0
        ? Math.round(card.totalCorrect / card.totalReviews * 100)
        : null;
      return {
        ...w,
        status,
        accuracy,
        dueDate:      card ? card.dueDate : null,
        streak:       card ? card.streak : 0,
        totalReviews: card ? card.totalReviews : 0,
      };
    });

    const STATUS_ORDER = { due: 0, new: 1, learned: 2 };
    let currentSort = 'status';

    const sortWords = (words) => {
      const arr = [...words];
      if (currentSort === 'status') {
        arr.sort((a, b) => {
          const d = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          return d !== 0 ? d : a.es.localeCompare(b.es, 'es');
        });
      } else if (currentSort === 'hardest' || currentSort === 'easiest') {
        const dir = currentSort === 'hardest' ? 1 : -1;
        arr.sort((a, b) => {
          if (a.accuracy === null && b.accuracy === null) return a.es.localeCompare(b.es, 'es');
          if (a.accuracy === null) return 1;
          if (b.accuracy === null) return -1;
          return dir * (a.accuracy - b.accuracy) || a.es.localeCompare(b.es, 'es');
        });
      } else if (currentSort === 'streak') {
        arr.sort((a, b) => b.streak - a.streak || a.es.localeCompare(b.es, 'es'));
      } else if (currentSort === 'most-reviewed') {
        arr.sort((a, b) => b.totalReviews - a.totalReviews || a.es.localeCompare(b.es, 'es'));
      }
      return arr;
    };

    const buildCallouts = () => {
      const reviewed = enriched.filter(w => w.totalReviews > 0);
      if (reviewed.length === 0) return '';

      const hardestWords = enriched
        .filter(w => w.totalReviews >= 3)
        .sort((a, b) => a.accuracy - b.accuracy || a.es.localeCompare(b.es, 'es'))
        .slice(0, 3);

      const streakWord = [...reviewed].sort((a, b) =>
        b.streak - a.streak || a.es.localeCompare(b.es, 'es')
      )[0];

      const mostReviewedWord = [...reviewed].sort((a, b) =>
        b.totalReviews - a.totalReviews || a.es.localeCompare(b.es, 'es')
      )[0];

      const hardestHtml = hardestWords.length === 0
        ? `<span class="wl-callout-word" style="font-size:0.82rem;color:var(--muted)">Need 3+ reviews</span>`
        : `<div class="wl-callout-hardest-list">${hardestWords.map(w =>
            `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-width:0">
              <span class="wl-callout-word">${w.es}</span>
              <span class="wl-callout-stat"><strong>${w.accuracy}%</strong></span>
            </div>`
          ).join('')}</div>`;

      const streakHtml = streakWord.streak === 0
        ? `<span class="wl-callout-word" style="color:var(--muted)">—</span>
           <span class="wl-callout-stat">No streak yet</span>`
        : `<span class="wl-callout-word">${streakWord.es}</span>
           <span class="wl-callout-stat"><strong>${streakWord.streak}</strong> in a row</span>`;

      const mostReviewedHtml = `
        <span class="wl-callout-word">${mostReviewedWord.es}</span>
        <span class="wl-callout-stat"><strong>${mostReviewedWord.totalReviews}</strong> reviews</span>`;

      return `<div class="wl-callouts">
        <div class="wl-callout-card">
          <div class="wl-callout-label">Hardest Words</div>
          ${hardestHtml}
        </div>
        <div class="wl-callout-card">
          <div class="wl-callout-label">Longest Streak</div>
          ${streakHtml}
        </div>
        <div class="wl-callout-card">
          <div class="wl-callout-label">Most Reviewed</div>
          ${mostReviewedHtml}
        </div>
      </div>`;
    };

    const SORTS = [
      { key: 'status',        label: 'Status' },
      { key: 'hardest',       label: 'Hardest' },
      { key: 'easiest',       label: 'Easiest' },
      { key: 'streak',        label: 'Streak' },
      { key: 'most-reviewed', label: 'Most Reviewed' },
    ];

    this._root.innerHTML = `
      <header class="app-header">
        <button class="btn btn-secondary" id="btn-back">← Back</button>
        <h2 style="flex:1;text-align:center">Words (${enriched.length})</h2>
        <div style="width:64px"></div>
      </header>
      <div id="wl-callouts-container">${buildCallouts()}</div>
      <div class="wl-sort-pills" id="wl-sort-pills">
        ${SORTS.map(s =>
          `<button class="wl-sort-pill${currentSort === s.key ? ' active' : ''}" data-sort="${s.key}">${s.label}</button>`
        ).join('')}
      </div>
      <input id="wl-search" class="input" type="search"
        placeholder="Search Spanish or English…"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <div id="wl-list" class="wl-list"></div>
    `;

    this._root.querySelector('#btn-back').addEventListener('click', () => this.go('home'));

    const listEl   = this._root.querySelector('#wl-list');
    const searchEl = this._root.querySelector('#wl-search');

    const renderList = (q = '') => {
      const lower = q.trim().toLowerCase();
      const filtered = lower
        ? enriched.filter(w =>
            w.es.toLowerCase().includes(lower) ||
            w.en.toLowerCase().includes(lower))
        : enriched;

      const visible = sortWords(filtered);

      if (!visible.length) {
        listEl.innerHTML = `<p class="muted" style="text-align:center;padding:24px 0">No words match.</p>`;
        return;
      }

      listEl.innerHTML = visible.map((w, i) => {
        const acc     = w.accuracy !== null ? `<span class="wl-accuracy">${w.accuracy}%</span>` : '';
        const posHtml = w.pos && w.pos !== 'word' ? ` · <span class="wl-pos">${w.pos}</span>` : '';
        return `
          <div class="wl-row">
            <button class="wl-row-main" data-i="${i}">
              <div class="wl-row-words">
                <span class="wl-es">${w.es}</span>
                <span class="wl-en">${w.en}${posHtml}</span>
              </div>
              <div class="wl-row-meta">
                ${acc}
                <span class="wl-status wl-status-${w.status}">${w.status}</span>
                <span class="wl-arrow">›</span>
              </div>
            </button>
            <div class="wl-row-detail" id="wl-detail-${i}" style="display:none"></div>
          </div>`;
      }).join('');

      listEl.querySelectorAll('.wl-row-main').forEach(btn => {
        btn.addEventListener('click', () => {
          const i      = parseInt(btn.dataset.i);
          const detail = listEl.querySelector(`#wl-detail-${i}`);
          const arrow  = btn.querySelector('.wl-arrow');
          const open   = detail.style.display !== 'none';

          if (open) {
            detail.style.display = 'none';
            btn.classList.remove('wl-row-open');
            arrow.textContent = '›';
            return;
          }

          btn.classList.add('wl-row-open');
          arrow.textContent = '↓';
          detail.style.display = 'block';

          if (detail.dataset.loaded) return;
          detail.dataset.loaded = '1';

          const w = visible[i];
          detail.innerHTML = `<p class="muted" style="font-size:0.82rem;padding:2px 0 10px">Loading…</p>`;

          lookupSentence(w.es).then(sentence => {
            const src = sentence || w.example || null;
            const dueLine = w.dueDate
              ? `<p class="wl-due-line">Next review: ${w.dueDate}</p>`
              : '';
            if (src) {
              const escaped = w.es.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const hl = src.replace(new RegExp(`(${escaped})`, 'gi'), '<strong>$1</strong>');
              detail.innerHTML = `<p class="book-sentence wl-sentence">«${hl}»</p>${dueLine}`;
            } else {
              detail.innerHTML = `<p class="muted" style="font-size:0.82rem;padding:2px 0 6px">No book sentence found.</p>${dueLine}`;
            }
            detail.classList.add('reveal-up');
          });
        });
      });
    };

    this._root.querySelectorAll('.wl-sort-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSort = btn.dataset.sort;
        this._root.querySelectorAll('.wl-sort-pill').forEach(b =>
          b.classList.toggle('active', b.dataset.sort === currentSort)
        );
        renderList(searchEl.value);
      });
    });

    renderList();
    searchEl.focus();

    let t;
    searchEl.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => renderList(searchEl.value), 150);
    });
  }
}
