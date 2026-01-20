/**
 * Open a URL with Playwright Chromium and print console/page errors.
 * Usage: node scripts/check-console.js "http://localhost:3001/store?app=APP123&userId=test-adaptive&appId=APP123"
 */
const { chromium } = require('playwright');

const targetUrl =
  process.argv[2] ||
  'http://localhost:3001/store?app=APP123&userId=test-adaptive&appId=APP123';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      errors.push(`Console error: ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`Page error: ${err.message}`);
  });

  page.on('requestfailed', (req) => {
    errors.push(
      `Request failed: ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`,
    );
  });

  try {
    console.log(`Navigating to ${targetUrl} ...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForTimeout(5_000); // allow client scripts to run

    if (errors.length === 0) {
      console.log('No console/page errors captured.');
    } else {
      console.log('Captured errors:');
      for (const e of errors) console.log(`- ${e}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exitCode = 1;
});

