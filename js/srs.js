// js/srs.js — SM-2 spaced repetition

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function scoreCard(card, correct) {
  const c = { ...card };
  c.totalReviews += 1;

  if (correct) {
    c.totalCorrect += 1;
    c.streak += 1;

    let newInterval;
    if (c.streak === 1) {
      newInterval = 1;
    } else if (c.streak === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(c.interval * c.easeFactor);
    }
    c.interval = newInterval;

    const q = 5;
    c.easeFactor = Math.max(1.3, c.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  } else {
    c.streak = 0;
    c.interval = 1;
    c.easeFactor = Math.max(1.3, c.easeFactor - 0.2);
  }

  c.dueDate = addDays(todayStr(), c.interval);
  return c;
}

export function pickDueCards(allCards, today) {
  return Object.values(allCards)
    .filter(c => c.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
