const { chromium } = require('playwright');

async function detailedDailyRewardsTest() {
  console.log('🚀 Starting Detailed Daily Rewards Test...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 1. Открываем страницу
    console.log('📄 Opening page: http://localhost:3004/daily-rewards?app=APP123&userId=test-user-detailed&appId=APP123');
    await page.goto('http://localhost:3004/daily-rewards?app=APP123&userId=test-user-detailed&appId=APP123');

    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    // Ждем загрузки карточек наград
    await page.waitForTimeout(2000);

    // 2. Анализируем начальное состояние
    console.log('\n📊 === INITIAL STATE ANALYSIS ===');

    // Ищем все кнопки на странице
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🎯 Found ${buttonCount} buttons on page`);

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      console.log(`📄 Button ${i + 1}: "${buttonText}"`);
    }

    // Ищем элементы с текстом Active/Claimed/Inactive
    const statusElements = page.locator('div').filter({ hasText: /(Active|Claimed|Inactive)/ });
    const statusCount = await statusElements.count();
    console.log(`📊 Found ${statusCount} status elements`);

    for (let i = 0; i < Math.min(statusCount, 10); i++) {
      const status = statusElements.nth(i);
      const statusText = await status.textContent();
      console.log(`📊 Status ${i + 1}: "${statusText}"`);
    }

    // 3. Находим активную кнопку Claim Reward
    console.log('\n🎮 === CLAIMING REWARD ===');
    const claimButton = page.locator('button:has-text("Claim Reward")').first();
    const claimButtonExists = await claimButton.count() > 0;

    if (!claimButtonExists) {
      console.log('❌ No active claim button found!');
      return;
    }

    console.log('🎯 Found active claim button');
    const claimButtonText = await claimButton.textContent();
    console.log(`🎯 Claim button text: "${claimButtonText}"`);

    // 4. Получаем награду
    console.log('🖱️ Clicking claim button...');
    await claimButton.click();

    // Ждем завершения операции
    await page.waitForTimeout(3000);

    // 5. Анализируем состояние после получения награды
    console.log('\n📊 === POST-CLAIM STATE ANALYSIS ===');

    // Проверяем все кнопки после получения
    const allButtonsAfter = page.locator('button');
    const buttonCountAfter = await allButtonsAfter.count();
    console.log(`🎯 Found ${buttonCountAfter} buttons after claim`);

    let claimedButtonsFound = 0;
    for (let i = 0; i < buttonCountAfter; i++) {
      const button = allButtonsAfter.nth(i);
      const buttonText = await button.textContent();
      if (buttonText.includes('Claimed')) {
        claimedButtonsFound++;
        console.log(`📄 Claimed button ${claimedButtonsFound}: "${buttonText}"`);
      }
    }

    // 6. Проверяем конкретные требования
    console.log('\n✅ === REQUIREMENTS CHECK ===');

    // Проверка 1: Кнопка должна стать "Claimed"
    const claimedButtonsLocator = page.locator('button:has-text("Claimed")');
    const claimedButtonsCount = await claimedButtonsLocator.count();
    console.log(`1️⃣ Claimed buttons found: ${claimedButtonsCount} ${claimedButtonsCount > 0 ? '✅ SUCCESS' : '❌ FAILED'}`);

    // Проверка 2: Ищем любые таймеры на странице
    const pageText = await page.textContent('body');
    const hasTimerPattern = /\d{2}:\d{2}:\d{2}/.test(pageText) || /Next:/.test(pageText);
    console.log(`2️⃣ Timer pattern found in page: ${hasTimerPattern ? '✅ SUCCESS' : '⚠️ WARNING (might appear later)'}`);

    // Проверка 3: Ищем SVG элементы (замки)
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log(`3️⃣ SVG elements (potential locks): ${svgCount} ${svgCount > 0 ? '✅ SUCCESS' : '❌ FAILED'}`);

    // 7. Делаем финальный скриншот
    await page.screenshot({ path: 'detailed-test-result.png', fullPage: true });
    console.log('📸 Detailed test screenshot saved as detailed-test-result.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'detailed-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Detailed test completed');
  }
}

detailedDailyRewardsTest();
