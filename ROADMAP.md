# Roadmap

## High Priority

### Google Sheets Vocabulary Source
The word list is currently hardcoded in `js/words.js`. Original design: pull from a public Google Sheet (Spanish + English columns) via Sheets API v4 with an API key (no OAuth). Words would be cached in localStorage with a 5-minute TTL.

Sheet: `https://docs.google.com/spreadsheets/d/10cfmWcHISq9_wkzBct1y-G9rcH66xoj-0xipFKrPgvg`

API call:
```
https://sheets.googleapis.com/v4/spreadsheets/{sheetId}/values/Sheet1!A:B?key={apiKey}
```

### Book Context Sentences
100anos.pdf is at the project root. Plan: extract with `pdftotext -enc UTF-8 100anos.pdf data/cien-anos.txt`, then run a one-time Node.js build script to produce `src/assets/word-index.json` — a map of `normalizedWord → [sentence1, sentence2, ...]`. The Type mode would then show a real sentence from the book instead of the placeholder example sentences.

### EN→ES Direction
Currently ES→EN only (see Spanish word, give English meaning). Add reverse: see English word, type Spanish. No book context needed for this direction — pure vocab recall. Mode select would offer both directions per study mode.

### Settings Screen
UI for entering Google Sheets API key and Sheet ID (stored in localStorage). Includes a "clear cache" button to force re-fetch from Sheets.

## Medium Priority

### Word List View
Searchable table of all vocabulary: Spanish word, English, part of speech, SRS status (new / due / learned), accuracy %. Click a word to expand and see the book context sentence(s).

### Deploy to Static Host
No build step needed — app is already static. Target: GitHub Pages or Netlify. Add a `.gitignore` for the PDF (large, copyrighted).

## Low Priority / Nice to Have

- PWA manifest + service worker for offline use and mobile home screen install
- Export/import progress as JSON (backup)
- Word-level stats view (hardest words, longest streak per word)
- Dark/light theme toggle (currently dark only)
