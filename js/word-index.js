// js/word-index.js
// Loads data/word-index.json and exposes lookupSentence(es).
// Returns a sentence from the book, or null if word not in index.

let _index = null;
let _loading = null;

function norm(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function load() {
  if (_index) return _index;
  if (_loading) return _loading;
  _loading = fetch('data/word-index.json')
    .then(r => r.ok ? r.json() : {})
    .catch(() => ({}))
    .then(data => { _index = data; return data; });
  return _loading;
}

// Warm the cache immediately at module load
load();

export async function lookupSentence(es) {
  const index = await load();
  const key = norm(es);
  const hits = index[key];
  if (!hits || hits.length === 0) return null;
  // Pick a random sentence from the available hits
  return hits[Math.floor(Math.random() * hits.length)];
}
