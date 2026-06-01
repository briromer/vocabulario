// scripts/build-index.js
// Usage: node scripts/build-index.js
// Fetches current vocab from Google Sheet, finds sentences in the book text,
// writes data/word-index.json used by the app to show words in context.
// Also outputs a quality report to stdout and data/index-report.txt.

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const TEXT_FILE    = path.join(ROOT, 'data', 'cien-anos.txt');
const OUT_FILE     = path.join(ROOT, 'data', 'word-index.json');
const SNAPSHOT_FILE = path.join(ROOT, 'data', 'word-snapshot.json');
const REPORT_FILE  = path.join(ROOT, 'data', 'index-report.txt');
const SHEET_ID     = '10cfmWcHISq9_wkzBct1y-G9rcH66xoj-0xipFKrPgvg';
const SHEET_URL    = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
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
  const lines = text
    .split('\n')
    .filter(l => !l.match(/^ebookelo\.com/i))
    .filter(l => !l.match(/^Cap[ií]tulo\s+\d+/i))
    .filter(l => !l.match(/^ePub/i))
    .filter(l => !l.match(/^Perseo|^Editor|^Correc|^T[ií]tulo|^Retoque/i))
    .filter(l => !l.match(/^Página\s+\d+/i));

  const paragraphs = lines.join('\n').split(/\n{2,}/);

  const sentences = [];
  for (const para of paragraphs) {
    const joined = para.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (!joined) continue;
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

// --- quality checks ----------------------------------------------------------

// Spanish: words ending in -ion/-cion/-sion without accent are almost always wrong.
// Words ending in -n/-s with penultimate stress need accent.
// Unaccented i/u between vowels where a diphthong break is needed (e.g. dia vs día).
// These are heuristics, not exhaustive.
const ACCENT_PATTERNS = [
  { re: /cion$/i,    hint: 'probably -ción (accent on o)' },
  { re: /sion$/i,    hint: 'probably -sión (accent on o)' },
  { re: /ion$/i,     hint: 'probably -ión (accent on o)' },
  { re: /es$/i,      hint: null },  // skip — very common valid ending
  { re: /on$/i,      hint: 'possibly -ón (accent on o)' },
  { re: /in$/i,      hint: 'possibly -ín (accent on i)' },
  { re: /un$/i,      hint: 'possibly -ún (accent on u)' },
  { re: /an$/i,      hint: 'possibly -án (accent on a)' },
  { re: /en$/i,      hint: null },  // skip — common verb form
  { re: /as$/i,      hint: null },  // skip
];

// Words known to be legitimately unaccented (common false positives).
const ACCENT_WHITELIST = new Set([
  'con', 'sin', 'son', 'van', 'han', 'tan', 'pan', 'man', 'can', 'don',
  'bien', 'quien', 'joven', 'orden', 'imagen', 'origen', 'examen', 'volumen',
  'resumen', 'virgen', 'margen', 'abdomen', 'almacen', 'certamen', 'regimen',
  'titulo', 'numero', 'ultimo', 'proximo', 'maximo', 'minimo', 'rapido',
  'unico', 'logico', 'magico', 'publico', 'medico', 'basico', 'tipico',
  'historico', 'economico', 'politico', 'acido', 'solido', 'fluido',
]);

function checkSpellingHints(esWord) {
  const w = esWord.trim().toLowerCase();
  if (ACCENT_WHITELIST.has(norm(w))) return null;

  // Has any accent already → skip
  if (/[áéíóúü]/i.test(w)) return null;

  for (const { re, hint } of ACCENT_PATTERNS) {
    if (hint && re.test(w)) return hint;
  }
  return null;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// --- report formatting -------------------------------------------------------

function section(title, items, formatter) {
  if (!items.length) return `### ${title}\n(none)\n`;
  return `### ${title} (${items.length})\n` + items.map(formatter).join('\n') + '\n';
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
    .map(r => ({
      es:      r[0].trim(),
      en:      r[1].trim(),
      pos:     (r[2] || '').trim(),
      example: (r[3] || '').trim(),
      normKey: norm(r[0]),
    }));

  console.log(`  ${words.length} words loaded from sheet`);

  // Load previous snapshot for new-words detection
  let prevKeys = new Set();
  if (fs.existsSync(SNAPSHOT_FILE)) {
    try {
      prevKeys = new Set(JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')));
    } catch { /* corrupt snapshot — treat all as new */ }
  }

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
      if (norm(sentence).includes(normKey)) hits.push(sentence);
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

  // Save snapshot for next run
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(words.map(w => w.normKey)), 'utf8');

  // -------------------------------------------------------------------------
  // Quality report
  // -------------------------------------------------------------------------

  const newWords = words.filter(w => !prevKeys.has(w.normKey));

  const notFound = words.filter(w => !index[w.normKey]);

  const spellingHints = words
    .map(w => ({ word: w, hint: checkSpellingHints(w.es) }))
    .filter(x => x.hint);

  // Duplicate English meanings
  const enMap = new Map();
  for (const w of words) {
    const key = w.en.toLowerCase();
    if (!enMap.has(key)) enMap.set(key, []);
    enMap.get(key).push(w.es);
  }
  const dupEn = [...enMap.entries()]
    .filter(([, ess]) => ess.length > 1)
    .map(([en, ess]) => ({ en, words: ess }));

  // Very short English meanings (< 3 chars)
  const shortEn = words.filter(w => w.en.length < 3);

  // Near-duplicate Spanish words (Levenshtein ≤ 2, different words)
  const nearDups = [];
  const normWords = words.map(w => norm(w.es));
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const d = levenshtein(normWords[i], normWords[j]);
      if (d > 0 && d <= 2) {
        nearDups.push({ a: words[i], b: words[j], dist: d });
      }
    }
  }

  const lines = [
    `# Index Quality Report`,
    `Generated from ${words.length} sheet words, ${sentences.length} book sentences`,
    `Coverage: ${matched}/${words.length} words found in text (${Math.round(matched/words.length*100)}%)`,
    '',
    section('New words since last build', newWords,
      w => `  + ${w.es} — ${w.en}${w.pos ? ` (${w.pos})` : ''}`),
    '',
    section('Not found in book text', notFound,
      w => `  ✗ ${w.es} — ${w.en}`),
    '',
    section('Spelling hints (missing accent?)', spellingHints,
      ({ word, hint }) => `  ? ${word.es} — ${hint}`),
    '',
    section('Near-duplicate Spanish words (Levenshtein ≤ 2)', nearDups,
      ({ a, b, dist }) => `  ~ "${a.es}" / "${b.es}" (distance ${dist}) — ${a.en} / ${b.en}`),
    '',
    section('Duplicate English meanings', dupEn,
      ({ en, words: ess }) => `  = "${en}" → ${ess.join(', ')}`),
    '',
    section('Very short English meanings (<3 chars)', shortEn,
      w => `  ! ${w.es} — "${w.en}"`),
  ];

  const report = lines.join('\n');

  console.log('\n' + '─'.repeat(60));
  console.log(report);
  console.log('─'.repeat(60));

  fs.writeFileSync(REPORT_FILE, report, 'utf8');
  console.log(`\nReport saved to ${REPORT_FILE}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
