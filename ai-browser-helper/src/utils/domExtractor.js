// src/utils/domExtractor.js
// Pulls page info once and keeps it light.

let cachedContext = null;

function cleanText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

export function getPageContext(maxLength = 9000) {
  if (cachedContext) {
    return cachedContext;
  }
  const selection = window.getSelection();
  const selectionText = cleanText(selection ? selection.toString() : '');
  const bodyText = cleanText(document.body ? document.body.innerText || '' : '');
  const mainText = selectionText || bodyText;
  const trimmedMain = mainText.slice(0, maxLength);
  cachedContext = {
    url: location.href,
    title: document.title || 'Untitled page',
    selectionText,
    mainText: trimmedMain,
  };
  return cachedContext;
}

export function resetContextCache() {
  cachedContext = null;
}
