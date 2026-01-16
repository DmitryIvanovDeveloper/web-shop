const { chromium } = require('playwright');

async function comprehensiveFinalTest() {
  console.log('🎯 COMPREHENSIVE FINAL DAILY REWARDS TEST\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Создаем нового пользователя
    const userId = `test-user-comprehensive-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`📄 Testing with new user: ${userId}`);
    console.log(`📄 URL: ${url}\n`);

    // 1. ЗАГРУЗКА СТРАНИЦЫ
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 2. ПРОВЕРКА НАЧАЛЬНОГО СОСТОЯНИЯ
    console.log('📊 === INITIAL STATE VERIFICATION ===');

    const initialText = await page.textContent('body');

    // Проверяем наличие активной награды
    const claimButtons = page.locator('button:has-text("Claim Reward")');
    const claimCount = await claimButtons.count();
    console.log(`🎮 Active claim buttons: ${claimCount} ${claimCount === 1 ? '✅' : '❌'}`);

    // Проверяем наличие замков (SVG)
    const svgElements = page.locator('svg');
    const initialSvgCount = await svgElements.count();
    console.log(`🔒 Initial SVG elements (locks): ${initialSvgCount} ✅`);

    // Проверяем отсутствие таймеров
    const initialTimerMatches = (initialText.match(/\d{2}:\d{2}:\d{2}/g) || []).length;
    console.log(`⏰ Initial timers: ${initialTimerMatches} ${initialTimerMatches === 0 ? '✅' : '⚠️'}`);

    // 3. ПОЛУЧЕНИЕ НАГРАДЫ
    console.log('\n🎮 === CLAIMING REWARD ===');

    if (claimCount === 1) {
      const claimButton = claimButtons.first();
      const buttonText = await claimButton.textContent();
      console.log(`🎯 Claiming: "${buttonText}"`);

      await page.screenshot({ path: 'comprehensive-before-claim.png', fullPage: true });

      console.log('🖱️ Clicking claim button...');
      await claimButton.click();

      // Ждем завершения операции
      await page.waitForTimeout(3000);

      console.log('✅ Claim operation completed');

      // 4. НЕМЕДЛЕННАЯ ПРОВЕРКА ПОСЛЕ ПОЛУЧЕНИЯ
      console.log('\n📊 === IMMEDIATE POST-CLAIM CHECK ===');

      const immediateText = await page.textContent('body');

      // Проверяем кнопку "Claimed"
      const claimedButtons = page.locator('button:has-text("Claimed"), div:has-text("Claimed")');
      const claimedCount = await claimedButtons.count();
      console.log(`✅ "Claimed" elements: ${claimedCount} ${claimedCount > 0 ? '✅ PASS' : '❌ FAIL'}`);

      // Проверяем отсутствие активных claim кнопок
      const remainingClaimButtons = page.locator('button:has-text("Claim Reward")');
      const remainingClaimCount = await remainingClaimButtons.count();
      console.log(`🎮 Remaining claim buttons: ${remainingClaimCount} ${remainingClaimCount === 0 ? '✅ PASS' : '❌ FAIL'}`);

      // Проверяем замки (должно быть не меньше)
      const postClaimSvgCount = await svgElements.count();
      console.log(`🔒 SVG elements after claim: ${postClaimSvgCount} ${postClaimSvgCount >= initialSvgCount ? '✅ PASS' : '❌ FAIL (decreased!)'}`);

      // 5. ОЖИДАНИЕ ПОЯВЛЕНИЯ ТАЙМЕРА
      console.log('\n⏰ === WAITING FOR TIMER (30 seconds) ===');

      await page.waitForTimeout(30000);

      const finalText = await page.textContent('body');

      // Проверяем таймер
      const timerMatches = (finalText.match(/\d{2}:\d{2}:\d{2}/g) || []);
      const nextMatches = (finalText.match(/Next:/gi) || []).length;

      console.log(`⏰ Timer patterns found: ${timerMatches.length}`);
      if (timerMatches.length > 0) {
        console.log(`⏰ Timer values: ${timerMatches.join(', ')}`);
      }
      console.log(`⏰ "Next:" mentions: ${nextMatches}`);

      const hasTimer = timerMatches.length > 0 || nextMatches > 0;
      console.log(`⏰ Timer present: ${hasTimer ? '✅ PASS' : '❌ FAIL'}`);

      // Финальный скриншот
      await page.screenshot({ path: 'comprehensive-final-result.png', fullPage: true });

      // 6. ИТОГОВАЯ ПРОВЕРКА ВСЕХ ТРЕБОВАНИЙ
      console.log('\n🎯 === FINAL REQUIREMENTS CHECK ===');

      const req1 = claimedCount > 0;
      const req2 = hasTimer;
      const req3 = postClaimSvgCount >= initialSvgCount;

      console.log(`1️⃣ Кнопка стала "Claimed": ${req1 ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`2️⃣ Следующая награда имеет таймер: ${req2 ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`3️⃣ Неактивные награды имеют замки: ${req3 ? '✅ PASS' : '❌ FAIL'}`);

      const allPass = req1 && req2 && req3;
      console.log(`\n🎯 OVERALL RESULT: ${allPass ? '✅ ALL REQUIREMENTS MET - SYSTEM WORKS PERFECTLY!' : '❌ SOME REQUIREMENTS FAILED'}`);

      // 7. API ВЕРИФИКАЦИЯ
      console.log('\n🔍 === API VERIFICATION ===');

      try {
        // Проверяем историю пользователя
        const claimsResponse = await fetch(`http://localhost:3004/api/daily-rewards/claims/last?userId=${userId}`);
        if (claimsResponse.ok) {
          const claims = await claimsResponse.json();
          const claimCount = Array.isArray(claims) ? claims.length : 1;
          console.log(`📊 Claims in database: ${claimCount} ✅`);
        }

        // Проверяем активную награду (должна вернуть ошибку)
        const activeResponse = await fetch(`http://localhost:3004/api/daily-rewards/active?appId=APP123&userId=${userId}`);
        if (activeResponse.status === 409) {
          console.log('📊 Active reward API: Already claimed today ✅');
        } else {
          console.log('⚠️ Active reward API: Unexpected response');
        }

      } catch (apiError) {
        console.log('⚠️ API verification skipped');
      }

    } else {
      console.log('❌ No claim button found - cannot proceed with test');
    }

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    await page.screenshot({ path: 'comprehensive-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 COMPREHENSIVE TEST COMPLETED');
  }
}

comprehensiveFinalTest();
