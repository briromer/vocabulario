// scripts/build-index.js
// Usage: node scripts/build-index.js
// Fetches current vocab from Google Sheet, finds sentences in the book text,
// writes data/word-index.json used by the app to show words in context.

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const TEXT_FILE  = path.join(ROOT, 'data', 'cien-anos.txt');
const OUT_FILE   = path.join(ROOT, 'data', 'word-index.json');
const SHEET_ID   = '10cfmWcHISq9_wkzBct1y-G9rcH66xoj-0xipFKrPgvg';
const SHEET_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const MAX_SENTENCES = 5;

// --- normalise ---------------------------------------------------------------

function norm(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- CSV parser --------------------------------------------------------------

function parseCSV(text) {
  const rows = [];
  for (const line of text.trim().split('\n')) {
    const cells = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cells.push(cur.trim()); cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

// --- sentence splitter -------------------------------------------------------

function extractSentences(text) {
  // Strip ebook metadata lines
  const lines = text
    .split('\n')
    .filter(l => !l.match(/^ebookelo\.com/i))
    .filter(l => !l.match(/^Cap[ií]tulo\s+\d+/i))
    .filter(l => !l.match(/^ePub/i))
    .filter(l => !l.match(/^Perseo|^Editor|^Correc|^T[ií]tulo|^Retoque/i))
    .filter(l => !l.match(/^Página\s+\d+/i));

  // Join paragraphs (blank line = paragraph break)
  const paragraphs = lines.join('\n').split(/\n{2,}/);

  const sentences = [];
  for (const para of paragraphs) {
    const joined = para.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (!joined) continue;

    // Split on sentence-ending punctuation followed by space + capital or end
    const parts = joined.split(/(?<=[.!?»])\s+(?=[«"¡¿A-ZÁÉÍÓÚÜÑ])/u);
    for (const s of parts) {
      const clean = s.trim();
      if (clean.length >= 40 && clean.length <= 600) {
        sentences.push(clean);
      }
    }
  }
  return sentences;
}

// --- main --------------------------------------------------------------------

async function main() {
  console.log('Fetching vocabulary from Google Sheet…');
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const csvText = await res.text();

  const rows = parseCSV(csvText).slice(1); // skip header
  const words = rows
    .filter(r => r[0] && r[1])
    .map(r => ({ es: r[0].trim(), normKey: norm(r[0]) }));

  console.log(`  ${words.length} words loaded from sheet`);

  console.log('Reading book text…');
  const text = fs.readFileSync(TEXT_FILE, 'utf8');
  const sentences = extractSentences(text);
  console.log(`  ${sentences.length} sentences extracted`);

  console.log('Building word index…');
  const index = {};
  let matched = 0;

  for (const { es, normKey } of words) {
    const hits = [];
    for (const sentence of sentences) {
      if (hits.length >= MAX_SENTENCES) break;
      const normSentence = norm(sentence);
      // Match the normalised word as a substring (handles inflections)
      if (normSentence.includes(normKey)) {
        hits.push(sentence);
      }
    }
    if (hits.length > 0) {
      index[normKey] = hits;
      matched++;
    }
  }

  console.log(`  ${matched}/${words.length} words found in text`);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2), 'utf8');
  console.log(`Written to ${OUT_FILE}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
