// tests/srs.test.js
import { scoreCard, pickDueCards, todayStr } from '../js/srs.js';

export async function runSrsTests({ suite, report, assert }) {
  suite('SRS');

  const baseCard = {
    wordId: 'w001',
    interval: 1,
    easeFactor: 2.5,
    dueDate: '2020-01-01',
    streak: 0,
    totalReviews: 0,
    totalCorrect: 0,
  };

  try {
    const updated = scoreCard({ ...baseCard }, true);
    assert(updated.streak === 1, `streak should be 1, got ${updated.streak}`);
    assert(updated.totalReviews === 1, 'totalReviews incremented');
    assert(updated.totalCorrect === 1, 'totalCorrect incremented');
    assert(updated.interval > 1, `interval should grow on correct, got ${updated.interval}`);
    report('scoreCard correct: streak, counts, interval grow', true);
  } catch (e) { report('scoreCard correct: streak, counts, interval grow', false, e.message); }

  try {
    const card = { ...baseCard, streak: 5, interval: 10 };
    const updated = scoreCard(card, false);
    assert(updated.streak === 0, 'streak resets on wrong');
    assert(updated.interval === 1, 'interval resets to 1 on wrong');
    assert(updated.totalReviews === 1, 'totalReviews incremented');
    assert(updated.totalCorrect === 0, 'totalCorrect not incremented');
    report('scoreCard wrong: streak and interval reset', true);
  } catch (e) { report('scoreCard wrong: streak and interval reset', false, e.message); }

  try {
    const card = { ...baseCard, easeFactor: 1.3 };
    const updated = scoreCard(card, false);
    assert(updated.easeFactor >= 1.3, `easeFactor below 1.3: ${updated.easeFactor}`);
    report('scoreCard: easeFactor floor at 1.3', true);
  } catch (e) { report('scoreCard: easeFactor floor at 1.3', false, e.message); }

  try {
    const updated = scoreCard({ ...baseCard }, true);
    const today = todayStr();
    assert(updated.dueDate >= today, `dueDate ${updated.dueDate} should be today or later`);
    report('scoreCard correct: dueDate advances', true);
  } catch (e) { report('scoreCard correct: dueDate advances', false, e.message); }

  try {
    const today = todayStr();
    const cards = {
      w001: { ...baseCard, wordId: 'w001', dueDate: '2020-01-01' },
      w002: { ...baseCard, wordId: 'w002', dueDate: '2099-01-01' },
      w003: { ...baseCard, wordId: 'w003', dueDate: today },
    };
    const due = pickDueCards(cards, today);
    assert(due.length === 2, `expected 2 due cards, got ${due.length}`);
    const ids = due.map(c => c.wordId);
    assert(ids.includes('w001') && ids.includes('w003'), 'correct cards selected');
    report('pickDueCards selects past and today cards', true);
  } catch (e) { report('pickDueCards selects past and today cards', false, e.message); }
}
