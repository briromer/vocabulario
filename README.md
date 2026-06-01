# Vocabulario

Personal Spanish vocabulary study app built while reading *Cien años de soledad*. Three study modes, spaced repetition, book context sentences, no server required.

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
  app.css               — Design system (OKLCH tokens, aurora palette)
js/
  app.js                — Entry point, bootstraps router
  router.js             — Screen manager (home, mode-select, study, stats, settings)
  session.js            — Session queue builder (due cards → new words, configurable size)
  store.js              — localStorage adapter (cards + sessions)
  srs.js                — SM-2 spaced repetition scoring
  fuzzy.js              — Levenshtein fuzzy answer checker (≤2 edits)
  sheets.js             — Google Sheets CSV fetch + 5-min localStorage cache
  word-index.js         — Loads data/word-index.json, exposes lookupSentence(es)
  config.js             — Sheet ID + session size persistence
  words.js              — Fallback word list (used when sheet is unreachable)
  modes/
    type.js             — Type-the-answer renderer
    flashcard.js        — Blur-dissolve flashcard renderer
    multiple-choice.js  — Multiple-choice renderer
tests/
  test.html             — In-browser test runner
  store.test.js
  srs.test.js
  fuzzy.test.js
  session.test.js
data/
  word-index.json       — Word → book sentences map (gitignored, built locally)
  cien-anos.txt         — Extracted PDF text (gitignored, copyrighted source)
scripts/
  build-index.js        — Builds word-index.json from PDF + Google Sheet
```

## Study Modes

| Mode | How it works |
|---|---|
| Type the Answer | See Spanish word + book sentence, type English meaning. Fuzzy match (Levenshtein ≤ 2) accepted. |
| Flashcard | Click to reveal translation with blur dissolve. Self-mark right or wrong. Space/Enter to flip. |
| Multiple Choice | Pick from 4 options. Keys 1–4 to select. |

## Spaced Repetition

SM-2 algorithm. Cards due today (or overdue) shown first, then new words. Default session size is 20 cards; configurable in ⚙ Settings. Correct answers push the next review out by an increasing interval. Wrong answers reset to 1 day.

## Vocabulary Source

Words come from a public Google Sheet (no API key). Sheet columns: A = Spanish, B = English, C = part of speech, D = example sentence. Cached in localStorage with a 5-min TTL. Clear via ⚙ Settings → "Clear Vocabulary Cache".

Sheet ID is pre-configured. Change it in ⚙ Settings → "Google Sheet ID". The sheet must be set to "Anyone with the link can view".

## Book Context Sentences

Type and Flashcard modes show real sentences from *Cien años de soledad*. The index is built offline:

```bash
pdftotext -enc UTF-8 100anos.pdf data/cien-anos.txt   # one-time PDF extraction
node scripts/build-index.js                            # fetches sheet + rebuilds index
```

`data/word-index.json` maps normalized Spanish words → up to 5 book sentences each. Re-run whenever the sheet changes. Both derived files are gitignored (copyrighted source).

## Tech Stack

Vanilla HTML/CSS/JS — no build step, no framework, no dependencies. ES modules (`type="module"`). localStorage for all persistence. Served with Python's built-in HTTP server.
