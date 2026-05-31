// tests/session.test.js
import { Session } from '../js/session.js';
import { WORDS }   from '../js/words.js';

export async function runSessionTests({ suite, report, assert }) {
  suite('Session');

  try {
    const session = new Session({ allCards: {}, words: WORDS, sessionSize: 5 });
    assert(session.total() === 5, `total should be 5, got ${session.total()}`);
    assert(session.remaining() === 5, 'remaining initially equals total');
    report('Session: initialises with correct count', true);
  } catch (e) { report('Session: initialises with correct count', false, e.message); }

  try {
    const session = new Session({ allCards: {}, words: WORDS, sessionSize: 5 });
    const card = session.nextCard();
    assert(card !== null, 'first nextCard not null');
    assert(typeof card.wordId === 'string', 'card has wordId');
    assert(typeof card.word === 'object', 'card has word object');
    report('Session: nextCard returns card with word', true);
  } catch (e) { report('Session: nextCard returns card with word', false, e.message); }

  try {
    const session = new Session({ allCards: {}, words: WORDS, sessionSize: 3 });
    session.nextCard();
    assert(session.remaining() === 2, 'remaining decrements after nextCard');
    report('Session: remaining decrements', true);
  } catch (e) { report('Session: remaining decrements', false, e.message); }

  try {
    const session = new Session({ allCards: {}, words: WORDS, sessionSize: 2 });
    session.nextCard();
    session.nextCard();
    assert(session.nextCard() === null, 'nextCard returns null when exhausted');
    report('Session: nextCard returns null when done', true);
  } catch (e) { report('Session: nextCard returns null when done', false, e.message); }

  try {
    const session = new Session({ allCards: {}, words: WORDS, sessionSize: 5 });
    session.nextCard();
    session.recordResult(true);
    assert(session.correctCount() === 1, 'correct count tracks');
    session.nextCard();
    session.recordResult(false);
    assert(session.correctCount() === 1, 'correct count not incremented on wrong');
    report('Session: recordResult tracks correct count', true);
  } catch (e) { report('Session: recordResult tracks correct count', false, e.message); }
}
