// Debug script to test Use Case directly
const { chromium } = require('playwright');

async function debugUseCase() {
  console.log('🔍 DEBUGGING USE CASE LOGIC\n');

  // Test API directly
  console.log('1️⃣ Testing API endpoint...');
  try {
    const apiResponse = await fetch('http://localhost:3004/api/daily-rewards/next?appId=APP123&userId=test-user-workability');
    const apiData = await apiResponse.json();
    console.log('✅ API Response:', JSON.stringify(apiData, null, 2));
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }

  console.log('\n2️⃣ Testing Repository (via UI)...');
  console.log('Open browser and check console logs for Presenter messages...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = 'http://localhost:3004/daily-rewards?app=APP123&userId=test-user-workability&appId=APP123';
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Check page content
    const pageText = await page.textContent('body');
    console.log('📄 Page contains "Claimed":', pageText.includes('Claimed'));
    console.log('📄 Page contains timers:', /\d{2}:\d{2}:\d{2}/.test(pageText));

    await page.screenshot({ path: 'debug-usecase-result.png', fullPage: true });

  } catch (error) {
    console.log('❌ Browser test failed:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n🏁 DEBUG COMPLETED');
}

debugUseCase();
