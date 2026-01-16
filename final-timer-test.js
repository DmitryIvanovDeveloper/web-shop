const { chromium } = require('playwright');

async function finalTimerTest() {
  console.log('🎯 FINAL TIMER LOGIC TEST\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Используем существующего пользователя, который уже получил Day 1
    const userId = 'test-user-final-verification';
    console.log(`👤 Testing with existing user who already claimed Day 1: ${userId}`);

    // Проверяем, что пользователь действительно получил награду
    const claimsResponse = await fetch(`http://localhost:3004/api/daily-rewards/claims/last?userId=${userId}`);
    if (!claimsResponse.ok) {
      console.log('❌ User has no claims');
      return;
    }

    const claims = await claimsResponse.json();
    console.log(`✅ User has ${claims.length} claim(s)`);

    // 2. Открываем страницу
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;
    console.log(`📄 Opening page: ${url}`);

    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 3. Проверяем начальное состояние
    console.log('\n📊 === CHECKING INITIAL STATE ===');

    const initialText = await page.textContent('body');

    // Day 1 должна быть "Claimed"
    const day1Claimed = initialText.includes('Claimed');
    console.log(`✅ Day 1 shows "Claimed": ${day1Claimed ? '✅' : '❌'}`);

    // Не должно быть активных claim кнопок
    const claimButtons = page.locator('button:has-text("Claim Reward")');
    const claimCount = await claimButtons.count();
    console.log(`🎮 Active claim buttons: ${claimCount} ${claimCount === 0 ? '✅' : '❌'}`);

    // 4. Ждем таймер
    console.log('\n⏰ === WAITING FOR TIMER ===');

    let timerFound = false;
    let timerValue = '';
    let waitTime = 0;

    while (waitTime < 35) { // Ждем до 35 секунд
      const currentText = await page.textContent('body');
      const timerMatch = currentText.match(/\d{2}:\d{2}:\d{2}/);

      if (timerMatch && timerMatch[0] !== '00:00:00') { // Игнорируем 00:00:00
        timerFound = true;
        timerValue = timerMatch[0];
        console.log(`⏰ Timer found after ${waitTime} seconds: "${timerValue}" ✅`);
        break;
      }

      await page.waitForTimeout(1000);
      waitTime++;
    }

    if (!timerFound) {
      console.log('❌ Timer not found within 35 seconds');

      // Для отладки показываем текущее содержимое
      const debugText = await page.textContent('body');
      console.log('📄 Current page content (first 500 chars):', debugText.substring(0, 500));
    }

    // 5. Проверяем замки
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log(`🔒 SVG elements (locks): ${svgCount} ${svgCount > 0 ? '✅' : '❌'}`);

    // 6. Финальные результаты
    console.log('\n🎯 === FINAL RESULTS ===');

    const allCorrect = day1Claimed && claimCount === 0 && timerFound && svgCount > 0;

    console.log(`1️⃣ Day 1 shows "Claimed": ${day1Claimed ? '✅' : '❌'}`);
    console.log(`2️⃣ No active claim buttons: ${claimCount === 0 ? '✅' : '❌'}`);
    console.log(`3️⃣ Timer appears on next reward: ${timerFound ? '✅' : '❌'}`);
    console.log(`4️⃣ Locks on inactive rewards: ${svgCount > 0 ? '✅' : '❌'}`);

    console.log(`\n🎉 OVERALL: ${allCorrect ? '✅ TIMER LOGIC WORKS PERFECTLY!' : '❌ ISSUES REMAIN'}`);

    // Скриншот
    await page.screenshot({ path: 'final-timer-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as final-timer-test-result.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'final-timer-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 FINAL TIMER TEST COMPLETED');
  }
}

finalTimerTest();
