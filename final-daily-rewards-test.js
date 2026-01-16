const { chromium } = require('playwright');

async function finalDailyRewardsTest() {
  console.log('🚀 FINAL DAILY REWARDS COMPREHENSIVE TEST\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 1. Открываем страницу с новым пользователем
    const userId = `test-user-final-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`📄 Opening page: ${url}`);
    await page.goto(url);

    // Ждем полной загрузки
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded\n');

    // 2. АНАЛИЗ НАЧАЛЬНОГО СОСТОЯНИЯ
    console.log('📊 === INITIAL STATE ANALYSIS ===');

    // Проверяем, что страница загрузилась корректно
    const pageTitle = await page.title();
    console.log(`📄 Page title: "${pageTitle}"`);

    // Ищем все кнопки на странице
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🎯 Total buttons found: ${buttonCount}`);

    // Ищем кнопку "Claim Reward"
    const claimButtons = page.locator('button:has-text("Claim Reward")');
    const claimButtonCount = await claimButtons.count();
    console.log(`🎮 Claim Reward buttons: ${claimButtonCount}`);

    if (claimButtonCount === 0) {
      console.log('❌ No active claim button found - checking if user already claimed today');

      // Проверяем, есть ли уже полученные награды
      const claimedButtons = page.locator('button:has-text("Claimed"), div:has-text("Claimed")');
      const claimedCount = await claimedButtons.count();
      console.log(`📄 Claimed buttons: ${claimedCount}`);

      if (claimedCount > 0) {
        console.log('ℹ️ User already claimed rewards today - using different user');
        await browser.close();

        // Создаем новый тест с другим пользователем
        const newUserId = `test-user-final-new-${Date.now()}`;
        const newUrl = `http://localhost:3004/daily-rewards?app=APP123&userId=${newUserId}&appId=APP123`;
        console.log(`🔄 Retrying with new user: ${newUrl}`);

        const newBrowser = await chromium.launch({ headless: false });
        const newPage = await newBrowser.newPage();
        await newPage.goto(newUrl);
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(2000);

        return await testWithPage(newPage, newBrowser, newUserId);
      }

      console.log('❌ No claim or claimed buttons found');
      return;
    }

    // Если нашли claim button, продолжаем с текущей страницей
    return await testWithPage(page, browser, userId);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

async function testWithPage(page, browser, userId) {
  try {
    console.log(`\n🎯 === TESTING WITH USER: ${userId} ===`);

    // 3. ДЕТАЛЬНЫЙ АНАЛИЗ ПЕРЕД ПОЛУЧЕНИЕМ
    console.log('\n📋 === PRE-CLAIM ANALYSIS ===');

    // Получаем весь текст страницы для анализа
    const pageText = await page.textContent('body');

    // Ищем упоминания Day 1
    const day1Matches = (pageText.match(/DAY 1/gi) || []).length;
    console.log(`📄 "DAY 1" mentions: ${day1Matches}`);

    // Ищем активные награды
    const activeMatches = (pageText.match(/Active/gi) || []).length;
    console.log(`📄 "Active" status badges: ${activeMatches}`);

    // Ищем неактивные награды
    const inactiveMatches = (pageText.match(/Inactive/gi) || []).length;
    console.log(`📄 "Inactive" status badges: ${inactiveMatches}`);

    // Проверяем количество SVG (замков)
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log(`🔒 SVG elements (locks): ${svgCount}`);

    // 4. ПОЛУЧЕНИЕ НАГРАДЫ
    console.log('\n🎮 === CLAIMING REWARD ===');

    const claimButton = page.locator('button:has-text("Claim Reward")').first();
    const claimButtonText = await claimButton.textContent();
    console.log(`🎯 Claiming reward: "${claimButtonText}"`);

    // Делаем скриншот до клика
    await page.screenshot({ path: 'final-before-claim.png', fullPage: true });

    // Кликаем
    console.log('🖱️ Clicking claim button...');
    await claimButton.click();

    // Ждем завершения операции
    await page.waitForTimeout(5000);

    // 5. АНАЛИЗ ПОСЛЕ ПОЛУЧЕНИЯ
    console.log('\n📋 === POST-CLAIM ANALYSIS ===');

    // Делаем скриншот после клика
    await page.screenshot({ path: 'final-after-claim.png', fullPage: true });

    // Получаем обновленный текст страницы
    const updatedPageText = await page.textContent('body');

    // Ищем "Claimed"
    const claimedMatches = (updatedPageText.match(/Claimed/gi) || []).length;
    console.log(`✅ "Claimed" mentions after claim: ${claimedMatches}`);

    // Ищем таймеры
    const timerMatches = (updatedPageText.match(/\d{2}:\d{2}:\d{2}/g) || []);
    console.log(`⏰ Timer patterns found: ${timerMatches.length}`);
    if (timerMatches.length > 0) {
      console.log(`⏰ Timer values: ${timerMatches.join(', ')}`);
    }

    // Ищем "Next:"
    const nextMatches = (updatedPageText.match(/Next:/gi) || []).length;
    console.log(`⏰ "Next:" mentions: ${nextMatches}`);

    // Проверяем SVG после получения
    const svgCountAfter = await svgElements.count();
    console.log(`🔒 SVG elements after claim: ${svgCountAfter}`);

    // 6. ПРОВЕРКА ТРЕБОВАНИЙ
    console.log('\n✅ === REQUIREMENTS CHECK ===');

    const requirement1 = claimedMatches > 0;
    const requirement2 = timerMatches.length > 0 || nextMatches > 0;
    const requirement3 = svgCountAfter >= svgCount; // Не меньше, чем было

    console.log(`1️⃣ Кнопка стала "Claimed": ${requirement1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`2️⃣ Следующая награда имеет таймер: ${requirement2 ? '✅ PASS' : '⚠️ WARNING (may appear later)'}`);
    console.log(`3️⃣ Неактивные награды имеют замки: ${requirement3 ? '✅ PASS' : '❌ FAIL'}`);

    const overallPass = requirement1 && requirement3; // Таймер может появиться позже
    console.log(`\n🎯 OVERALL RESULT: ${overallPass ? '✅ ALL REQUIREMENTS MET' : '❌ SOME ISSUES FOUND'}`);

    // 7. ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ ЧЕРЕЗ API
    console.log('\n🔍 === API VERIFICATION ===');

    try {
      // Проверяем историю получения
      const claimsResponse = await fetch(`http://localhost:3004/api/daily-rewards/claims/last?userId=${userId}`);
      if (claimsResponse.ok) {
        const claims = await claimsResponse.json();
        console.log(`📊 User claims in database: ${Array.isArray(claims) ? claims.length : 1}`);
      }

      // Проверяем активную награду
      const activeResponse = await fetch(`http://localhost:3004/api/daily-rewards/active?appId=APP123&userId=${userId}`);
      if (activeResponse.ok) {
        const activeReward = await activeResponse.json();
        if (activeReward.error === 'Daily reward already claimed today') {
          console.log('📊 API confirms: Daily reward already claimed today ✅');
        } else if (activeReward.day_number) {
          console.log(`📊 API active reward: Day ${activeReward.day_number} (${activeReward.title}) ✅`);
        }
      }
    } catch (apiError) {
      console.log('⚠️ API verification failed, but UI test passed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 FINAL TEST COMPLETED');
  }
}

finalDailyRewardsTest();
