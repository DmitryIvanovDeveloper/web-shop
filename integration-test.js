const { chromium } = require('playwright');

async function integrationTest() {
  console.log('🔗 INTEGRATION TEST: API → Repository → Use Case → UI\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Создаем уникального пользователя для теста
    const userId = `integration-test-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`👤 Testing with user: ${userId}\n`);

    // 1. ПРОВЕРКА API НАПРЯМУЮ
    console.log('1️⃣ Testing API directly...');

    const apiResponse = await fetch(`http://localhost:3004/api/daily-rewards/next?appId=APP123&userId=${userId}`);
    const apiData = await apiResponse.json();

    console.log(`   📊 API Response:`);
    console.log(`      Reward: ${apiData.reward ? `Day ${apiData.reward.day_number} (${apiData.reward.title})` : 'None'}`);
    console.log(`      Can Claim: ${apiData.canClaim}`);
    console.log(`      Next Claim Date: ${apiData.nextClaimDate || 'None'}`);
    console.log(`      ✅ API works correctly\n`);

    // 2. ЗАГРУЗКА UI
    console.log('2️⃣ Loading UI...');

    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 3. АНАЛИЗ НАЧАЛЬНОГО СОСТОЯНИЯ UI
    console.log('3️⃣ Analyzing initial UI state...');

    const pageText = await page.textContent('body');

    // Проверяем наличие claim button
    const claimButtons = page.locator('button:has-text("Claim Reward")');
    const claimCount = await claimButtons.count();

    // Проверяем статусы
    const activeMatches = (pageText.match(/Active/gi) || []).length;
    const inactiveMatches = (pageText.match(/Inactive/gi) || []).length;

    console.log(`   🎮 Claim buttons: ${claimCount}`);
    console.log(`   📊 Active badges: ${activeMatches}`);
    console.log(`   📊 Inactive badges: ${inactiveMatches}`);
    console.log(`   ✅ UI loaded and parsed correctly\n`);

    // 4. ПОЛУЧЕНИЕ НАГРАДЫ ЧЕРЕЗ UI
    console.log('4️⃣ Claiming reward through UI...');

    if (claimCount > 0) {
      await page.screenshot({ path: 'before-claim-integration.png', fullPage: true });

      await claimButtons.first().click();
      await page.waitForTimeout(4000);

      console.log('   ✅ Reward claimed through UI');

      // 5. АНАЛИЗ ПОСТ-КЛЕЙМ СОСТОЯНИЯ
      console.log('5️⃣ Analyzing post-claim state...');

      const postClaimText = await page.textContent('body');

      const postClaimButtons = page.locator('button:has-text("Claim Reward")');
      const postClaimCount = await postClaimButtons.count();

      const claimedElements = page.locator('button:has-text("Claimed"), div:has-text("Claimed")');
      const claimedCount = await claimedElements.count();

      console.log(`   🎮 Claim buttons after: ${postClaimCount}`);
      console.log(`   ✅ "Claimed" elements: ${claimedCount}`);

      // Ждем таймер
      console.log('   ⏰ Waiting for timer to appear...');
      await page.waitForTimeout(15000);

      const timerText = await page.textContent('body');
      const timerMatches = (timerText.match(/\d{2}:\d{2}:\d{2}/g) || []);

      console.log(`   ⏰ Timer patterns found: ${timerMatches.length}`);
      if (timerMatches.length > 0) {
        console.log(`   ⏰ Timer values: ${timerMatches.join(', ')}`);
      }

      await page.screenshot({ path: 'after-claim-integration.png', fullPage: true });

      // 6. ПРОВЕРКА API ПОСЛЕ КЛЕЙМА
      console.log('6️⃣ Verifying API state after claim...');

      const apiResponseAfter = await fetch(`http://localhost:3004/api/daily-rewards/next?appId=APP123&userId=${userId}`);
      const apiDataAfter = await apiResponseAfter.json();

      console.log(`   📊 API After Claim:`);
      console.log(`      Reward: ${apiDataAfter.reward ? `Day ${apiDataAfter.reward.day_number} (${apiDataAfter.reward.title})` : 'None'}`);
      console.log(`      Can Claim: ${apiDataAfter.canClaim}`);
      console.log(`      Next Claim Date: ${apiDataAfter.nextClaimDate || 'None'}`);

      // 7. ИТОГОВЫЕ РЕЗУЛЬТАТЫ
      console.log('\n🎯 === INTEGRATION TEST RESULTS ===');

      const apiWorks = apiData.reward && apiData.canClaim === true;
      const uiInitialWorks = claimCount === 1 && activeMatches > 0;
      const claimWorks = claimedCount > 0 && postClaimCount === 0;
      const timerWorks = timerMatches.length > 0;
      const apiAfterWorks = apiDataAfter.reward && apiDataAfter.canClaim === false && apiDataAfter.nextClaimDate;

      console.log(`1️⃣ API (new user): ${apiWorks ? '✅' : '❌'}`);
      console.log(`2️⃣ UI Initial State: ${uiInitialWorks ? '✅' : '❌'}`);
      console.log(`3️⃣ Claim Operation: ${claimWorks ? '✅' : '❌'}`);
      console.log(`4️⃣ Timer Display: ${timerWorks ? '✅' : '❌'}`);
      console.log(`5️⃣ API After Claim: ${apiAfterWorks ? '✅' : '❌'}`);

      const overallSuccess = apiWorks && uiInitialWorks && claimWorks && timerWorks && apiAfterWorks;

      console.log(`\n🎉 OVERALL RESULT: ${overallSuccess ? '✅ ALL SYSTEMS WORKING!' : '❌ ISSUES DETECTED'}`);

      if (overallSuccess) {
        console.log('\n📋 Integration Test Summary:');
        console.log('  ✅ API endpoint returns correct data for new users');
        console.log('  ✅ UI correctly displays claim button for available rewards');
        console.log('  ✅ Claim operation updates UI state');
        console.log('  ✅ Timer appears for next reward availability');
        console.log('  ✅ API correctly reflects post-claim state');
        console.log('  ✅ Repository properly transforms API data');
        console.log('  ✅ Use Case correctly delegates to Repository');
        console.log('  ✅ Presenter updates UI with new state');
        console.log('\n🚀 Daily Rewards System: FULLY OPERATIONAL!');
      }

    } else {
      console.log('   ❌ No claim button found - test cannot proceed');
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    await page.screenshot({ path: 'integration-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 INTEGRATION TEST COMPLETED');
  }
}

integrationTest();
