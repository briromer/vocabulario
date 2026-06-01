# Roadmap

## Shipped

- **Google Sheets vocabulary source** — live CSV export, 5-min localStorage cache, no API key
- **Book context sentences** — `scripts/build-index.js` extracts sentences from *Cien años de soledad*, stored in `data/word-index.json`; Type and Flashcard modes show real book sentences styled as typeset quotations
- **Settings screen** — Sheet ID field, session size (default 20), "Save & Test", "Clear Vocabulary Cache"
- **Design system** — OKLCH aurora palette (midnight Norway: dark sky, amber accent, teal/green aurora gradients), DM Serif Display + DM Sans typography, SVG feTurbulence grain overlay, 3-layer radial background
- **Study modes** — Type, Flashcard (blur-dissolve flip), Multiple Choice; keyboard shortcuts throughout
- **Spaced repetition** — SM-2 algorithm, due cards first then new words, configurable session size
- **Animation pass** — Screen transitions, progress bar with glow, error shake, correct glow pulse, flashcard action reveal
- **Delight pass** — Book sentences in DM Serif Display, time-of-day Spanish greeting, session-end literary line, console easter egg
- **EN→ES direction** — direction toggle pill on mode select; all three modes support reverse; book sentences hidden during prompt, revealed in feedback; accent-insensitive fuzzy matching in both directions
- **Visual feedback pass** — type-in verdict chip + large answer display (correct/fuzzy/wrong states); ghost-at-rest Study Now + flashcard mark buttons; book sentence contrast, highlight target word, no italics
- **Index quality report** — `build-index.js` outputs new words, not-found words, spelling hints, near-duplicate Spanish, duplicate English, short English meanings; snapshot-based new-word detection; saves to `data/index-report.txt`
- **Word List View** — searchable table with Spanish, English, POS, SRS status (new/due/learned), accuracy %; click to expand book sentence with highlighted target word; due → new → learned sort order
- **GitHub Pages deploy** — live at https://briromer.github.io/vocabulario/
- **Word-level stats** — callout strip (3 hardest words, longest streak, most reviewed) + sort pills (Status / Hardest / Easiest / Streak / Most Reviewed) on Word List View

---

## Low Priority / Nice to Have

- PWA manifest + service worker for offline use and mobile install
- Export/import progress as JSON
