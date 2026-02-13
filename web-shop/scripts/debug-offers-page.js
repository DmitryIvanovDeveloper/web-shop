const { chromium } = require('playwright');

async function debugOffersPage() {
  console.log('🚀 Starting Playwright browser...');
  
  // Launch browser in headed mode (visible)
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down actions by 500ms for better visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toISOString();
    
    consoleLogs.push({ timestamp, type, text });
    
    // Print to terminal with color coding
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${text}`);
  });

  // Collect network errors
  page.on('pageerror', (error) => {
    console.error('❌ Page Error:', error.message);
  });

  // Collect failed requests
  page.on('requestfailed', (request) => {
    console.error('❌ Request Failed:', request.url(), request.failure()?.errorText);
  });

  // Monitor responses
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    
    // Log API calls related to offers/scenarios
    if (url.includes('/api/merchant-admin/offers') || url.includes('scenarios') || url.includes('rules')) {
      console.log(`📡 API Response: ${status} ${url}`);
      
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const body = await response.json();
          console.log(`📦 Response Body:`, JSON.stringify(body, null, 2));
        }
      } catch (e) {
        console.log('⚠️  Could not parse response body');
      }
    }
  });

  try {
    // You need to provide the appId as a query parameter
    // Replace 'YOUR_APP_ID' with actual appId or pass it as an argument
    const appId = process.argv[2] || 'YOUR_APP_ID';
    const url = `http://localhost:3000/merchant-admin/offers?appId=${appId}`;
    
    console.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    console.log('✅ Page loaded successfully');
    console.log('👀 Browser will stay open. Press Ctrl+C to close.');
    console.log('📊 Watching console logs...\n');

    // Keep the browser open until manually closed
    await page.waitForTimeout(300000); // Wait for 5 minutes or until manually closed

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    // Save logs to file
    const fs = require('fs');
    const logsPath = './debug-offers-logs.json';
    fs.writeFileSync(logsPath, JSON.stringify(consoleLogs, null, 2));
    console.log(`\n💾 Console logs saved to: ${logsPath}`);
    
    // Don't close automatically - let user explore
    console.log('\n⏸️  Browser session ended. Logs are saved.');
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Closing browser...');
  process.exit(0);
});

debugOffersPage().catch(console.error);
