// src/options.js
// Saves and loads the OpenAI API key.

const apiKeyInput = document.getElementById('apiKey');
const statusEl = document.getElementById('status');
const saveBtn = document.getElementById('save');

async function loadKey() {
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (apiKey) {
    apiKeyInput.value = apiKey;
  }
}

async function saveKey() {
  const value = apiKeyInput.value.trim();
  await chrome.storage.sync.set({ apiKey: value });
  statusEl.textContent = 'Saved! You can close this tab.';
  setTimeout(() => {
    statusEl.textContent = '';
  }, 2000);
}

saveBtn.addEventListener('click', saveKey);
loadKey();
