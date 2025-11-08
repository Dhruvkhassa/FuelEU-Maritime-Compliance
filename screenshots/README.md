# Screenshots and UI capture instructions

This folder contains guidance and placeholder filenames for UI screenshots to include in the repository.

Recommended screenshots (save as the exact filenames below):

- `routes.png` — Routes tab showing the list of routes and baseline marker
- `compare.png` — Compare tab showing baseline vs comparison routes and calculated GHGIE_actual
- `banking.png` — Banking tab showing banked records and apply flow
- `pooling.png` — Pooling tab showing pool creation and adjusted compliance balances

How to capture (manual):

1. Start the backend and frontend locally:

```powershell
cd backend; npm install; npm run dev
# open a new terminal
cd frontend; npm install; npm run dev
```

2. Open your browser at `http://localhost:3000` (or the port printed by Vite).
3. Navigate to each tab and use your OS or browser screenshot tool to capture the view. Save the images into this `screenshots/` folder using the filenames above.

Optional: automated capture using Playwright (local setup):

1. Install Playwright: `npm i -D playwright`
2. Create a short script that visits the pages and captures screenshots. Example (place in `scripts/capture.js`):

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'screenshots/routes.png', fullPage: true });
  // navigate to other tabs and capture them similarly
  await browser.close();
})();
```

Then run: `node scripts/capture.js` (after starting the dev servers).

If you want, I can generate Playwright capture scripts for you — say the word and I will add them.
