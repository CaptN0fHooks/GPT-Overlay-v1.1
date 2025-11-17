// src/contentScript.js
// Injects the floating AI button and the sidebar overlay when needed.

(async () => {
  if (window.__aiHelperInjected) return;
  window.__aiHelperInjected = true;

  const { initOverlay } = await import(chrome.runtime.getURL('src/overlay.js'));
  const { getPageContext, resetContextCache } = await import(chrome.runtime.getURL('src/utils/domExtractor.js'));

  const button = document.createElement('div');
  button.id = 'ai-helper-floating-button';
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#111827',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '700',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
    cursor: 'pointer',
    zIndex: 2147483647,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  });
  button.textContent = 'AI';
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 10px 24px rgba(0,0,0,0.28)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 6px 18px rgba(0,0,0,0.22)';
  });

  document.documentElement.appendChild(button);

  let overlayRoot = null;
  let overlayApi = null;

  async function ensureOverlay() {
    if (overlayApi) return overlayApi;
    resetContextCache();
    const shadowHost = document.createElement('div');
    shadowHost.id = 'ai-helper-overlay-host';
    shadowHost.style.position = 'fixed';
    shadowHost.style.top = '0';
    shadowHost.style.right = '0';
    shadowHost.style.zIndex = '2147483646';
    shadowHost.style.pointerEvents = 'none';
    document.documentElement.appendChild(shadowHost);

    overlayRoot = shadowHost.attachShadow({ mode: 'open' });
    overlayApi = await initOverlay({
      shadowRoot: overlayRoot,
      getPageContext,
    });
    return overlayApi;
  }

  button.addEventListener('click', async () => {
    const api = await ensureOverlay();
    api.toggle();
  });
})();
