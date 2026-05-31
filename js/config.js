// js/config.js
const KEY = 'vocab:config';

export function getConfig() {
  const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
  return {
    apiKey: stored.apiKey || '',
    sheetId: stored.sheetId || '10cfmWcHISq9_wkzBct1y-G9rcH66xoj-0xipFKrPgvg',
  };
}

export function saveConfig({ apiKey, sheetId }) {
  localStorage.setItem(KEY, JSON.stringify({ apiKey, sheetId }));
}

export function isConfigured() {
  const { apiKey, sheetId } = getConfig();
  return Boolean(apiKey && sheetId);
}
