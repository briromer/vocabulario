// js/sheets.js
import { getSheetId } from './config.js';

const CACHE_KEY = 'vocab:sheet_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

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

function wordId(es) {
  return 'sh_' + es.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

export async function loadSheetWords() {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const sheetId = getSheetId();
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);

  const rows = parseCSV(await res.text()).slice(1); // skip header row

  const words = rows
    .filter(r => r[0] && r[1])
    .map(r => ({
      id:      wordId(r[0]),
      es:      r[0],
      en:      r[1],
      pos:     r[2] || 'word',
      example: r[3] || '',
    }));

  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: words }));
  return words;
}

export function clearSheetCache() {
  localStorage.removeItem(CACHE_KEY);
}
