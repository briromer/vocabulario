# Vocabulario — Claude Context

Spanish vocabulary study app. Vanilla JS, no build step, no framework. All state in localStorage.

## Running

```bash
python3 -m http.server 8787   # http://localhost:8787
# Tests: open tests/test.html in browser
```

## Key Facts

- **No build step.** Files are served directly. No npm, no Vite, no bundler.
- **ES modules.** All JS uses `import`/`export`. Files must be served over HTTP (not file://).
- **Tests are browser-based.** `tests/test.html` runs in-browser. No Node.js test runner. Tests use localStorage so they need a real browser context.
- **Word list is in `js/words.js`.** 60 hardcoded words. Future: pull from Google Sheets (see ROADMAP.md).
- **Study modes are pure renderers.** `render(container, card, onResult)` — populate DOM, call `onResult({correct, card, advance})` on user action. No side effects on SRS state (router handles that).
- **SRS state lives in localStorage** under `vocab:cards` and `vocab:sessions`. Use `Store` class (`js/store.js`) — never read/write localStorage directly.

## Architecture

```
router.js          orchestrates screens and SRS update after each answer
  └── modes/*.js   pure renderers, know nothing about SRS or store
  └── session.js   builds the card queue (due → new → fill), tracks session state
  └── store.js     localStorage adapter
  └── srs.js       SM-2 scoring (pure functions, no side effects)
  └── fuzzy.js     answer checking (pure functions)
```

## Adding Words

Edit `js/words.js`. Each entry: `{ id, es, en, pos, example }`. IDs must be unique strings (e.g. `'w061'`). `pos` values: `noun | verb | adj | adv`.

## What's Not Built Yet

See ROADMAP.md. The biggest gaps vs. original design:
1. **Google Sheets** as vocabulary source (currently hardcoded)
2. **Book context sentences** from the PDF (currently placeholder sentences)
3. **EN→ES reverse mode** (currently ES→EN only)
4. **Settings screen** for API key/Sheet ID

## Coding Conventions

- No comments except where WHY is non-obvious
- No TypeScript, no JSDoc
- Vanilla DOM manipulation (no virtual DOM, no templates)
- CSS via custom properties defined in `css/app.css :root`
- New screens go in `router.js` as `_showScreenName()` methods
- New study modes go in `js/modes/` with signature `export function render(container, card, onResult)`

## PDF

`100anos.pdf` is at project root. Copyrighted — do not commit to public repo. Used only for extracting book context sentences (see ROADMAP.md).
