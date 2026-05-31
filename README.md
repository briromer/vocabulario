# Vocabulario

Personal Spanish vocabulary study app built while reading *Cien años de soledad*. Three study modes, spaced repetition, no server required.

## Running

```bash
python3 -m http.server 8787
# open http://localhost:8787
```

## Tests

Open `tests/test.html` in the browser. All 4 suites (SRS, Store, Fuzzy, Session) should be green.

## Project Structure

```
index.html              — App entry point
css/
  reset.css             — Minimal CSS reset
  app.css               — Design system (CSS custom properties)
js/
  words.js              — Word list (60 Spanish words with examples)
  store.js              — localStorage read/write (cards + sessions)
  srs.js                — SM-2 spaced repetition scoring
  session.js            — Session queue builder (due cards → new words)
  fuzzy.js              — Levenshtein fuzzy answer checker
  router.js             — Screen manager (home, mode-select, study, stats)
  app.js                — Entry point, bootstraps router
  modes/
    type.js             — Type-the-answer renderer
    flashcard.js        — Flashcard flip renderer
    multiple-choice.js  — Multiple-choice renderer
tests/
  test.html             — In-browser test runner
  store.test.js
  srs.test.js
  fuzzy.test.js
  session.test.js
docs/
  superpowers/
    specs/              — Design documents
    plans/              — Implementation plans
```

## Study Modes

| Mode | How it works |
|---|---|
| Type the Answer | See Spanish word + example sentence, type English meaning. Fuzzy match (Levenshtein ≤ 2) accepted. |
| Flashcard Flip | Click card to reveal translation. Self-mark right/wrong. Space/Enter to flip. |
| Multiple Choice | Pick from 4 options. Keys 1–4 to select. |

## Spaced Repetition

SM-2 algorithm. Cards due today (or overdue) shown first, then new words, up to 10 per session. Correct answers push the next review out by an increasing interval. Wrong answers reset to 1 day.

## Tech Stack

Vanilla HTML/CSS/JS — no build step, no framework, no dependencies. ES modules (`type="module"`). localStorage for all persistence.
