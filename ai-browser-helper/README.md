# AI Browser Helper (Chrome Extension)

A tiny, clean Chrome helper that shows a floating **AI** button on every page. Click it to open a right-side chat that can explain, summarize, or answer questions about the page you are reading.

## What it does
- Adds a small round **AI** button in the bottom-right corner on every site.
- When clicked, a right sidebar slides in with a chat box.
- It reads the page text (or your selection) and asks OpenAI for a clear answer.
- It sleeps quietly until you click it, keeping things light.

## Folder layout
```
ai-browser-helper/
  manifest.json
  README.md
  src/
    background.js
    contentScript.js
    overlay.html
    overlay.css
    overlay.js
    options.html
    options.js
    utils/
      openaiClient.js
      domExtractor.js
    icons/
      icon16.png
      icon48.png
      icon128.png
  assets/ (optional)
```

Use any simple PNG icons in `src/icons/` (16x16, 48x48, 128x128).

## Setup steps (copy/paste friendly)
1. Create the folders
   - **Windows PowerShell example:**
     ```powershell
     mkdir ai-browser-helper
     cd ai-browser-helper
     mkdir src, src\utils, src\icons, assets
     ```
   - **WSL / macOS Terminal example:**
     ```bash
     mkdir -p ai-browser-helper/src/utils ai-browser-helper/src/icons ai-browser-helper/assets
     cd ai-browser-helper
     ```
2. Create the files
   - Make the files listed above and paste the code from this guide into each one.
3. Add icons
   - Put any simple PNG icons in `src/icons/` named `icon16.png`, `icon48.png`, `icon128.png`.
4. Load the extension in Chrome
   1. Open Chrome and visit `chrome://extensions`.
   2. Turn on **Developer mode** (top-right switch).
   3. Click **Load unpacked**.
   4. Choose the `ai-browser-helper` folder.
5. Add your OpenAI API key
   1. On the `chrome://extensions` page, find **AI Browser Helper**.
   2. Click **Details** → **Extension options**.
   3. Paste your OpenAI API key (looks like `sk-...`) and click **Save**.
6. Use it
   - Visit any page.
   - Click the round **AI** button (bottom-right).
   - In the sidebar, click **Explain page**, **Summarize**, or type your own question and press **Send**.

## Notes
- The helper keeps resource use low by sleeping until you interact with it.
- It only sends the page text (trimmed) and your request to OpenAI.
- If the text is too short or missing, you can expand the code to ask for a screenshot via the built-in screenshot message.
