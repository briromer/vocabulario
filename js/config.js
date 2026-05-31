// js/config.js
const KEY = 'vocab:config';
const DEFAULT_SHEET_ID = '10cfmWcHISq9_wkzBct1y-G9rcH66xoj-0xipFKrPgvg';

export function getSheetId() {
  const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
  return stored.sheetId || DEFAULT_SHEET_ID;
}

export function saveSheetId(sheetId) {
  localStorage.setItem(KEY, JSON.stringify({ sheetId: sheetId || DEFAULT_SHEET_ID }));
}
