// js/config.js
const KEY = 'vocab:config';
const DEFAULT_SHEET_ID = '10cfmWcHISq9_wkzBct1y-G9rcH66xoj-0xipFKrPgvg';
const DEFAULT_SESSION_SIZE = 20;

function getConfig() {
  return JSON.parse(localStorage.getItem(KEY) || '{}');
}

function saveConfig(patch) {
  localStorage.setItem(KEY, JSON.stringify({ ...getConfig(), ...patch }));
}

export function getSheetId() {
  return getConfig().sheetId || DEFAULT_SHEET_ID;
}

export function saveSheetId(sheetId) {
  saveConfig({ sheetId: sheetId || DEFAULT_SHEET_ID });
}

export function getSessionSize() {
  const v = getConfig().sessionSize;
  return (v && v > 0) ? v : DEFAULT_SESSION_SIZE;
}

export function saveSessionSize(n) {
  saveConfig({ sessionSize: Math.max(1, Math.min(200, parseInt(n, 10) || DEFAULT_SESSION_SIZE)) });
}

export function getDirection() {
  return getConfig().direction === 'en-es' ? 'en-es' : 'es-en';
}

export function saveDirection(dir) {
  saveConfig({ direction: dir === 'en-es' ? 'en-es' : 'es-en' });
}
