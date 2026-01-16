const { chromium } = require('playwright');

async function testTimerLogic() {
  console.log('⏰ TESTING TIMER LOGIC AFTER CLAIMING DAY 1\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Создаем нового пользователя для чистого теста
    const userId = `test-timer-logic-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`👤 Testing with user: ${userId}`);
    console.log(`📄 URL: ${url}\n`);

    // 1. ЗАГРУЗКА СТРАНИЦЫ
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('📊 === CHECKING INITIAL STATE ===');

    // Проверяем Day 1 - должна быть активной
    const day1Card = page.locator('[style*="width: 220px"]').first();
    const day1Text = await day1Card.textContent();
    const hasClaimReward = day1Text.includes('Claim Reward');

    console.log(`🎯 Day 1 active: ${hasClaimReward ? '✅ YES' : '❌ NO'}`);
    console.log(`📝 Day 1 content preview: ${day1Text.substring(0, 100)}...\n`);

    if (!hasClaimReward) {
      console.log('❌ Day 1 is not active - test cannot proceed');
      return;
    }

    // 2. ПОЛУЧЕНИЕ DAY 1
    console.log('🎮 === CLAIMING DAY 1 ===');

    const claimButton = page.locator('button:has-text("Claim Reward")').first();
    await claimButton.click();
    await page.waitForTimeout(3000);

    console.log('✅ Day 1 claimed\n');

    // 3. ПРОВЕРКА СОСТОЯНИЯ ПОСЛЕ ПОЛУЧЕНИЯ
    console.log('📊 === CHECKING POST-CLAIM STATE ===');

    // Обновляем содержимое
    const postClaimText = await page.textContent('body');

    // Проверяем Day 1 - должна быть "Claimed"
    const day1Claimed = postClaimText.includes('Claimed');
    console.log(`✅ Day 1 shows "Claimed": ${day1Claimed ? '✅ YES' : '❌ NO'}`);

    // Проверяем отсутствие активных claim кнопок
    const claimButtonsAfter = page.locator('button:has-text("Claim Reward")');
    const claimCountAfter = await claimButtonsAfter.count();
    console.log(`🎮 Active claim buttons after: ${claimCountAfter} ${claimCountAfter === 0 ? '✅ CORRECT' : '❌ SHOULD BE 0'}`);

    // Ждем появления таймера (до 30 секунд)
    console.log('\n⏰ === WAITING FOR TIMER (30 seconds) ===');

    let timerFound = false;
    let timerValue = '';

    for (let i = 0; i < 30; i++) {
      const currentText = await page.textContent('body');
      const timerMatch = currentText.match(/\d{2}:\d{2}:\d{2}/);

      if (timerMatch) {
        timerFound = true;
        timerValue = timerMatch[0];
        console.log(`⏰ Timer appeared after ${i + 1} seconds: ${timerValue} ✅`);
        break;
      }

      await page.waitForTimeout(1000);
    }

    if (!timerFound) {
      console.log('❌ Timer did not appear within 30 seconds');
    }

    // 4. ПРОВЕРКА ЗАМКОВ
    console.log('\n🔒 === CHECKING LOCKS ===');

    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log(`🔒 Total SVG elements: ${svgCount}`);

    // Проверяем, что есть замки (SVG) для неактивных наград
    console.log(`🔒 Locks present: ${svgCount > 0 ? '✅ YES' : '❌ NO'}`);

    // 5. ИТОГОВЫЕ РЕЗУЛЬТАТЫ
    console.log('\n🎯 === FINAL RESULTS ===');

    const day1Correct = day1Claimed;
    const noActiveButtons = claimCountAfter === 0;
    const hasTimer = timerFound;
    const hasLocks = svgCount > 0;

    console.log(`1️⃣ Day 1 shows "Claimed": ${day1Correct ? '✅' : '❌'}`);
    console.log(`2️⃣ No active claim buttons: ${noActiveButtons ? '✅' : '❌'}`);
    console.log(`3️⃣ Timer appears on Day 2: ${hasTimer ? '✅' : '❌'}`);
    console.log(`4️⃣ Locks on inactive rewards: ${hasLocks ? '✅' : '❌'}`);

    const allCorrect = day1Correct && noActiveButtons && hasTimer && hasLocks;
    console.log(`\n🎉 OVERALL: ${allCorrect ? '✅ ALL REQUIREMENTS MET - TIMER LOGIC WORKS!' : '❌ ISSUES FOUND'}`);

    // Скриншот финального состояния
    await page.screenshot({ path: 'timer-logic-final.png', fullPage: true });
    console.log('📸 Final screenshot saved as timer-logic-final.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'timer-logic-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 TIMER LOGIC TEST COMPLETED');
  }
}

testTimerLogic();
