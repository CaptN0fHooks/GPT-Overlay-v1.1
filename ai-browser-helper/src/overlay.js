// src/overlay.js
// Builds the sidebar UI, handles chat flow, keeps it light.

import { fetchChatCompletion } from './utils/openaiClient.js';

const OVERLAY_HTML_URL = chrome.runtime.getURL('src/overlay.html');
const OVERLAY_CSS_URL = chrome.runtime.getURL('src/overlay.css');

function createBubble(text, role) {
  const div = document.createElement('div');
  div.className = `ai-bubble ${role}`;
  div.textContent = text;
  return div;
}

async function loadTemplate(shadowRoot) {
  const [htmlResp, cssResp] = await Promise.all([
    fetch(OVERLAY_HTML_URL),
    fetch(OVERLAY_CSS_URL),
  ]);
  const html = await htmlResp.text();
  const css = await cssResp.text();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const overlay = wrapper.firstElementChild;

  const style = document.createElement('style');
  style.textContent = css;
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(overlay);

  return overlay;
}

function buildPrompt(context, userMessage, mode = 'chat') {
  const parts = [];
  parts.push(`Page URL: ${context.url}`);
  parts.push(`Page title: ${context.title}`);
  parts.push(`Selected text (if any): ${context.selectionText || 'none'}`);
  parts.push(`Main text (trimmed): ${context.mainText}`);
  parts.push(`User request type: ${mode}`);
  parts.push(`User request: ${userMessage}`);
  return parts.join('\n');
}

export async function initOverlay({ shadowRoot, getPageContext: fetchContext }) {
  const overlay = await loadTemplate(shadowRoot);
  const overlayBox = overlay.querySelector('.ai-overlay');
  const messagesEl = overlay.querySelector('#ai-messages');
  const inputEl = overlay.querySelector('#ai-input');
  const sendBtn = overlay.querySelector('#ai-send');
  const actions = overlay.querySelector('.ai-actions');

  let isOpen = false;
  let busy = false;

  function toggle(open) {
    const nextState = typeof open === 'boolean' ? open : !isOpen;
    isOpen = nextState;
    overlayBox.classList.toggle('open', isOpen);
    shadowRoot.host.style.pointerEvents = isOpen ? 'auto' : 'none';
  }

  function addMessage(text, role) {
    const bubble = createBubble(text, role);
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function send(type, text) {
    if (busy) return;
    const trimmed = (text || '').trim();
    if (!trimmed && type === 'chat') return;

    busy = true;
    sendBtn.disabled = true;
    inputEl.disabled = true;

    const { apiKey } = await chrome.storage.sync.get('apiKey');
    if (!apiKey) {
      addMessage('You need to add your OpenAI API key in Settings to use the AI Helper.', 'ai');
      busy = false;
      sendBtn.disabled = false;
      inputEl.disabled = false;
      return;
    }

    const context = fetchContext();
    const userMessage = type === 'explain'
      ? 'Explain this page in simple words.'
      : type === 'summarize'
        ? 'Give a short summary of this page.'
        : trimmed;

    addMessage(userMessage, 'user');

    const prompt = buildPrompt(context, userMessage, type);
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly, concise assistant. Use the provided page context to answer. Keep responses brief unless the user asks for detail.',
      },
      { role: 'user', content: prompt },
    ];

    try {
      const reply = await fetchChatCompletion(apiKey, messages);
      addMessage(reply, 'ai');
    } catch (err) {
      addMessage(`Error: ${err.message}`, 'ai');
    } finally {
      busy = false;
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.value = '';
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', () => send('chat', inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      send('chat', inputEl.value);
    }
  });

  actions.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'close') {
      toggle(false);
    } else if (action === 'settings') {
      chrome.runtime.openOptionsPage();
    } else if (action === 'explain') {
      send('explain', 'Explain this page.');
    } else if (action === 'summarize') {
      send('summarize', 'Summarize this page.');
    }
  });

  // Friendly hint
  addMessage('Hi! Click “Explain page” or ask a question about what you see.', 'ai');

  return {
    toggle,
  };
}
