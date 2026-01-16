const { chromium } = require('playwright');

async function testDailyRewards() {
  console.log('🚀 Starting Daily Rewards Test...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 1. Открываем страницу
    console.log('📄 Opening page: http://localhost:3004/daily-rewards?app=APP123&userId=test-user-new&appId=APP123');
    await page.goto('http://localhost:3004/daily-rewards?app=APP123&userId=test-user-new&appId=APP123');

    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    // 2. Находим все карточки наград
    const rewardCards = page.locator('[data-testid*="reward-card"], .daily-reward-card, [class*="reward"]');
    const cardCount = await rewardCards.count();
    console.log(`🎯 Found ${cardCount} reward cards`);

    if (cardCount === 0) {
      // Попробуем найти по другому селектору
      const allDivs = page.locator('div');
      console.log('🔍 Looking for reward cards with different selectors...');

      // Проверим содержимое страницы
      const pageContent = await page.textContent('body');
      console.log('📄 Page content preview:', pageContent.substring(0, 500));
    }

    // 3. Ищем кнопку "Claim Reward"
    const claimButtons = page.locator('button:has-text("Claim Reward"), button[class*="claim"]');
    const claimButtonCount = await claimButtons.count();
    console.log(`🎮 Found ${claimButtonCount} claim buttons`);

    if (claimButtonCount > 0) {
      // Находим первую кнопку Claim Reward
      const firstClaimButton = claimButtons.first();
      const buttonText = await firstClaimButton.textContent();
      console.log(`🎯 Found claim button: "${buttonText}"`);

      // 4. Кликаем на кнопку получения награды
      console.log('🖱️ Clicking claim button...');
      await firstClaimButton.click();

      // Ждем изменения состояния
      await page.waitForTimeout(2000);

      // 5. Проверяем, что кнопка стала "Claimed"
      const claimedButtons = page.locator('button:has-text("Claimed"), div:has-text("Claimed")');
      const claimedCount = await claimedButtons.count();
      console.log(`✅ Found ${claimedCount} "Claimed" buttons after claiming`);

      if (claimedCount > 0) {
        console.log('✅ SUCCESS: Claim button changed to "Claimed"');
      } else {
        console.log('❌ FAILED: Claim button did not change to "Claimed"');
      }

      // 6. Ищем таймеры (следующая награда должна иметь таймер)
      const timers = page.locator('text=/\\d{2}:\\d{2}:\\d{2}/, text=/Next:/, text=/until next/');
      const timerCount = await timers.count();
      console.log(`⏰ Found ${timerCount} timers on the page`);

      if (timerCount > 0) {
        const timerText = await timers.first().textContent();
        console.log(`✅ SUCCESS: Found timer: "${timerText}"`);
      } else {
        console.log('❌ FAILED: No timers found');
      }

      // 7. Ищем замки (неактивные награды)
      const locks = page.locator('svg, [class*="lock"], text=/🔒/');
      const lockCount = await locks.count();
      console.log(`🔒 Found ${lockCount} lock icons`);

      if (lockCount > 0) {
        console.log('✅ SUCCESS: Found lock icons for inactive rewards');
      } else {
        console.log('⚠️ WARNING: No lock icons found (might be expected)');
      }

    } else {
      console.log('❌ FAILED: No claim buttons found');
    }

    // Делаем скриншот для анализа
    await page.screenshot({ path: 'daily-rewards-test.png', fullPage: true });
    console.log('📸 Screenshot saved as daily-rewards-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'daily-rewards-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as daily-rewards-error.png');
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

testDailyRewards();
