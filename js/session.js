// js/session.js
import { WORDS }              from './words.js';
import { todayStr, pickDueCards } from './srs.js';

const SESSION_SIZE = 10;

function buildQueue(allCards, words, size) {
  const today = todayStr();
  const wordMap = Object.fromEntries(words.map(w => [w.id, w]));

  const due = pickDueCards(allCards, today)
    .filter(c => wordMap[c.wordId])
    .map(c => ({ ...c, word: wordMap[c.wordId] }));

  const reviewedIds = new Set(Object.keys(allCards));
  const newWords = words
    .filter(w => !reviewedIds.has(w.id))
    .map(w => ({
      wordId: w.id,
      interval: 1,
      easeFactor: 2.5,
      dueDate: today,
      streak: 0,
      totalReviews: 0,
      totalCorrect: 0,
      word: w,
    }));

  return [...due, ...newWords].slice(0, size);
}

export class Session {
  constructor({ allCards = {}, words = WORDS, sessionSize = SESSION_SIZE } = {}) {
    this._queue = buildQueue(allCards, words, sessionSize);
    this._index = -1;
    this._correct = 0;
    this._startTime = Date.now();
  }

  total()        { return this._queue.length; }
  remaining()    { return Math.max(0, this._queue.length - (this._index + 1)); }
  correctCount() { return this._correct; }
  durationMs()   { return Date.now() - this._startTime; }

  nextCard() {
    this._index++;
    return this._queue[this._index] ?? null;
  }

  recordResult(correct) {
    if (correct) this._correct++;
  }

  currentCard() {
    return this._queue[this._index] ?? null;
  }

  toSessionRecord(mode) {
    return {
      date: todayStr(),
      mode,
      totalCards: this.total(),
      correctCount: this._correct,
      durationMs: this.durationMs(),
    };
  }
}
