# Roadmap

## Shipped

- **Google Sheets vocabulary source** — live CSV export, 5-min localStorage cache, no API key
- **Book context sentences** — `scripts/build-index.js` extracts sentences from *Cien años de soledad*, stored in `data/word-index.json`; Type and Flashcard modes show real book sentences styled as typeset quotations
- **Settings screen** — Sheet ID field, session size (default 20), "Save & Test", "Clear Vocabulary Cache"
- **Design system** — OKLCH aurora palette (midnight Norway: dark sky, amber accent, teal/green aurora gradients), DM Serif Display + DM Sans typography, SVG feTurbulence grain overlay, 3-layer radial background
- **Study modes** — Type, Flashcard (blur-dissolve flip), Multiple Choice; keyboard shortcuts throughout
- **Spaced repetition** — SM-2 algorithm, due cards first then new words, configurable session size
- **Animation pass** — Screen transitions, progress bar with glow, error shake, correct glow pulse, flashcard action reveal
- **Delight pass** — Book sentences in DM Serif Display italic, time-of-day Spanish greeting, session-end literary line, console easter egg

---

## High Priority

### Index Quality Report
When `node scripts/build-index.js` runs, output a quality report alongside the index:

- **New words** — words on the sheet not seen in the previous index build
- **Spelling suggestions** — Spanish words that look suspect (e.g. `indigacion` → did you mean `indagación`?)
- **Translation suggestions** — English meanings that may be wrong or imprecise: duplicates, very short values, POS mismatches
- **Not-found words** — words with zero book-sentence matches, flagged for review

Output to stdout and optionally `data/index-report.txt` (gitignored). Report only — no auto-edits.

### EN→ES Direction
Currently ES→EN only. Add reverse: see English word, type Spanish. No book context needed. Mode select offers both directions per study mode.

---

## Medium Priority

### Word List View
Searchable table: Spanish word, English, part of speech, SRS status (new / due / learned), accuracy %. Click to expand and see book context sentences.

### Deploy to Static Host
No build step needed — already static. Target: GitHub Pages or Netlify.

---

## Low Priority / Nice to Have

- PWA manifest + service worker for offline use and mobile install
- Export/import progress as JSON
- Word-level stats view (hardest words, longest streak)
