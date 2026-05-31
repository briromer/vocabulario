// tests/store.test.js
import { Store } from '../js/store.js';

export async function runStoreTests({ suite, report, assert }) {
  suite('Store');

  const s = new Store('test:');

  try {
    s.clear();
    const empty = s.getAllCards();
    assert(Object.keys(empty).length === 0, 'getAllCards on empty store');
    report('getAllCards returns {} when empty', true);
  } catch (e) { report('getAllCards returns {} when empty', false, e.message); }

  try {
    s.clear();
    const card = s.getOrCreateCard('w001');
    assert(card.wordId === 'w001', 'wordId set');
    assert(card.interval === 1, 'default interval 1');
    assert(card.easeFactor === 2.5, 'default easeFactor 2.5');
    assert(card.streak === 0, 'default streak 0');
    report('getOrCreateCard initialises defaults', true);
  } catch (e) { report('getOrCreateCard initialises defaults', false, e.message); }

  try {
    s.clear();
    const card = s.getOrCreateCard('w002');
    card.streak = 5;
    s.saveCard(card);
    const reloaded = s.getOrCreateCard('w002');
    assert(reloaded.streak === 5, 'streak persisted');
    report('saveCard persists card state', true);
  } catch (e) { report('saveCard persists card state', false, e.message); }

  try {
    s.clear();
    s.saveSession({ date: '2026-05-31', mode: 'type', totalCards: 10, correctCount: 8, durationMs: 60000 });
    const sessions = s.getSessions();
    assert(sessions.length === 1, 'one session saved');
    assert(sessions[0].mode === 'type', 'mode persisted');
    report('saveSession and getSessions round-trip', true);
  } catch (e) { report('saveSession and getSessions round-trip', false, e.message); }

  try {
    s.clear();
    const c = s.getOrCreateCard('w003');
    s.saveCard(c);
    s.clear();
    assert(Object.keys(s.getAllCards()).length === 0, 'cleared');
    report('clear() wipes cards', true);
  } catch (e) { report('clear() wipes cards', false, e.message); }
}
