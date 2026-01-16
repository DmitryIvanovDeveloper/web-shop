const { chromium } = require('playwright');

async function checkTimerAfterDelay() {
  console.log('⏰ CHECKING TIMER APPEARANCE AFTER DELAY\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Используем того же пользователя, который уже получил награду
    const userId = 'test-user-final-1768596339621';
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`📄 Opening page for user who already claimed: ${url}`);
    await page.goto(url);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded - checking for timer appearance...\n');

    // Проверяем состояние сразу
    let pageText = await page.textContent('body');
    let timerMatches = (pageText.match(/\d{2}:\d{2}:\d{2}/g) || []);
    let nextMatches = (pageText.match(/Next:/gi) || []).length;
    let claimedMatches = (pageText.match(/Claimed/gi) || []).length;

    console.log('📊 IMMEDIATE CHECK:');
    console.log(`   Claimed mentions: ${claimedMatches}`);
    console.log(`   Timer patterns: ${timerMatches.length} (${timerMatches.join(', ')})`);
    console.log(`   "Next:" mentions: ${nextMatches}`);

    // Ждем 10 секунд и проверяем снова
    console.log('\n⏳ Waiting 10 seconds for timer to appear...');
    await page.waitForTimeout(10000);

    pageText = await page.textContent('body');
    timerMatches = (pageText.match(/\d{2}:\d{2}:\d{2}/g) || []);
    nextMatches = (pageText.match(/Next:/gi) || []).length;
    claimedMatches = (pageText.match(/Claimed/gi) || []).length;

    console.log('📊 AFTER 10 SECONDS:');
    console.log(`   Claimed mentions: ${claimedMatches}`);
    console.log(`   Timer patterns: ${timerMatches.length} (${timerMatches.join(', ')})`);
    console.log(`   "Next:" mentions: ${nextMatches}`);

    // Ждем еще 20 секунд
    console.log('\n⏳ Waiting additional 20 seconds...');
    await page.waitForTimeout(20000);

    pageText = await page.textContent('body');
    timerMatches = (pageText.match(/\d{2}:\d{2}:\d{2}/g) || []);
    nextMatches = (pageText.match(/Next:/gi) || []).length;
    claimedMatches = (pageText.match(/Claimed/gi) || []).length;

    console.log('📊 AFTER 30 SECONDS TOTAL:');
    console.log(`   Claimed mentions: ${claimedMatches}`);
    console.log(`   Timer patterns: ${timerMatches.length} (${timerMatches.join(', ')})`);
    console.log(`   "Next:" mentions: ${nextMatches}`);

    // Финальный скриншот
    await page.screenshot({ path: 'timer-check-result.png', fullPage: true });
    console.log('📸 Screenshot saved as timer-check-result.png');

    const hasTimer = timerMatches.length > 0 || nextMatches > 0;
    console.log(`\n🎯 TIMER RESULT: ${hasTimer ? '✅ TIMER FOUND' : '❌ NO TIMER'}`);

  } catch (error) {
    console.error('❌ Timer check failed:', error);
    await page.screenshot({ path: 'timer-check-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 TIMER CHECK COMPLETED');
  }
}

checkTimerAfterDelay();
