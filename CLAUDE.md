# Vocabulario — Claude Context

Spanish vocabulary study app. Vanilla JS, no build step, no framework. All state in localStorage.

## Running

```bash
python3 -m http.server 8787   # http://localhost:8787
# Tests: open tests/test.html in browser
# Live: https://briromer.github.io/vocabulario/
```

## Word Index (Book Context Sentences)

`data/word-index.json` maps normalized Spanish words → sentences from the book. Generated from `100anos.pdf`.

Rebuild after adding words to the sheet:
```bash
pdftotext -enc UTF-8 100anos.pdf data/cien-anos.txt   # one-time PDF extraction
node scripts/build-index.js                            # fetches sheet + rebuilds index
```

Both `data/cien-anos.txt` and `data/word-index.json` are gitignored (derived from copyrighted PDF).

## Vocabulary Source

Words come from a public Google Sheet fetched as CSV (no API key). Sheet ID is pre-configured. Cache TTL: 5 min. Clear via ⚙ Settings → "Clear Vocabulary Cache".

Sheet columns: A = Spanish, B = English, C = part of speech (optional), D = example sentence (optional). Row 1 is the header.

## Key Facts

- **No build step.** Files are served directly. No npm, no Vite, no bundler.
- **ES modules.** All JS uses `import`/`export`. Must be served over HTTP (not `file://`).
- **Tests are browser-based.** `tests/test.html` runs in-browser. No Node.js test runner.
- **Study mode renderers are async.** `render(container, card, onResult, allWords, direction)` — async because they look up book sentences. `direction` is `'es-en'` or `'en-es'`. Router calls without await (safe: `onResult` fires from user interaction, always after render settles).
- **SRS state lives in localStorage** under `vocab:cards` and `vocab:sessions`. Use `Store` class — never touch localStorage directly.

## Architecture

```
router.js           orchestrates screens, loads vocab (sheets.js), tracks SRS after each answer
  └── modes/*.js    async renderers — lookup book sentences, populate DOM, call onResult
  └── session.js    builds card queue (due → new), tracks session state
  └── store.js      localStorage adapter (cards + sessions)
  └── srs.js        SM-2 scoring (pure functions)
  └── fuzzy.js      answer checking: exact / fuzzy (Levenshtein ≤ 2) / wrong
  └── sheets.js     fetches vocab CSV, caches in localStorage
  └── word-index.js loads data/word-index.json, exposes lookupSentence(es)
  └── config.js     persists sheet ID, session size, direction (es-en/en-es)
```

## Coding Conventions

- No comments except where WHY is non-obvious
- No TypeScript, no JSDoc
- Vanilla DOM manipulation
- CSS via custom properties in `css/app.css :root`
- New screens go in `router.js` as `_showScreenName()` methods
- New study modes go in `js/modes/` with signature `async function render(container, card, onResult, allWords)`
