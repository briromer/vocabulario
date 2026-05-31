// js/store.js
const DEFAULT_CARD = (wordId) => ({
  wordId,
  interval:      1,
  easeFactor:    2.5,
  dueDate:       new Date().toISOString().slice(0, 10),
  streak:        0,
  totalReviews:  0,
  totalCorrect:  0,
});

export class Store {
  constructor(prefix = 'vocab:') {
    this._k = prefix;
  }

  getAllCards() {
    const raw = localStorage.getItem(this._k + 'cards');
    return raw ? JSON.parse(raw) : {};
  }

  getOrCreateCard(wordId) {
    const all = this.getAllCards();
    return all[wordId] ? { ...all[wordId] } : DEFAULT_CARD(wordId);
  }

  saveCard(card) {
    const all = this.getAllCards();
    all[card.wordId] = card;
    localStorage.setItem(this._k + 'cards', JSON.stringify(all));
  }

  getSessions() {
    const raw = localStorage.getItem(this._k + 'sessions');
    return raw ? JSON.parse(raw) : [];
  }

  saveSession(record) {
    const sessions = this.getSessions();
    sessions.push(record);
    localStorage.setItem(this._k + 'sessions', JSON.stringify(sessions));
  }

  clear() {
    localStorage.removeItem(this._k + 'cards');
    localStorage.removeItem(this._k + 'sessions');
  }
}

export const store = new Store();
