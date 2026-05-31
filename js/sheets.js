// js/sheets.js
import { getConfig } from './config.js';

const CACHE_KEY = 'vocab:sheet_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function wordId(es) {
  return 'sh_' + es.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

export async function loadSheetWords() {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const { apiKey, sheetId } = getConfig();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:D?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const rows = (json.values || []).slice(1); // skip header row

  const words = rows
    .filter(r => r[0] && r[1])
    .map(r => ({
      id:      wordId(r[0]),
      es:      r[0].trim(),
      en:      r[1].trim(),
      pos:     r[2]?.trim() || 'word',
      example: r[3]?.trim() || '',
    }));

  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: words }));
  return words;
}

export function clearSheetCache() {
  localStorage.removeItem(CACHE_KEY);
}
