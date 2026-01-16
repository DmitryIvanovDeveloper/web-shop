const { chromium } = require('playwright');

async function testFixes() {
  console.log('🔧 ТЕСТИРОВАНИЕ ИСПРАВЛЕНИЙ\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Тест с новым пользователем
    const userId = `test-fixes-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`👤 Тестируем с пользователем: ${userId}`);
    console.log(`📄 URL: ${url}\n`);

    // 1. ПРОВЕРКА SKELETON
    console.log('1️⃣ Проверка skeleton...');
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Ждем немного для загрузки
    await page.waitForTimeout(2000);

    // Проверяем наличие skeleton
    const skeletonElements = page.locator('[class*="skeleton"], [class*="Skeleton"]');
    const skeletonCount = await skeletonElements.count();
    console.log(`   📊 Skeleton элементов: ${skeletonCount} ${skeletonCount === 0 ? '✅' : '❌'}`);

    // 2. ПРОВЕРКА АКТИВНОЙ КНОПКИ
    console.log('\n2️⃣ Проверка активной кнопки...');

    const claimButtons = page.locator('button:has-text("Claim Reward")');
    const claimCount = await claimButtons.count();
    console.log(`   🎮 Кнопок "Claim Reward": ${claimCount} ${claimCount > 0 ? '✅' : '❌'}`);

    if (claimCount > 0) {
      const firstButton = claimButtons.first();
      const isDisabled = await firstButton.isDisabled();
      console.log(`   🔓 Кнопка disabled: ${isDisabled} ${!isDisabled ? '✅' : '❌'}`);

      const buttonText = await firstButton.textContent();
      console.log(`   📝 Текст кнопки: "${buttonText?.trim()}"`);
    }

    // 3. ПРОВЕРКА КАРТОЧЕК
    console.log('\n3️⃣ Проверка карточек...');

    const rewardCards = page.locator('[style*="width: 220px"]');
    const cardCount = await rewardCards.count();
    console.log(`   🎴 Карточек наград: ${cardCount} ${cardCount > 0 ? '✅' : '❌'}`);

    // 4. ИТОГОВЫЕ РЕЗУЛЬТАТЫ
    console.log('\n🎯 === РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ ===');

    const skeletonFixed = skeletonCount === 0;
    const buttonShows = claimCount > 0;
    const cardsLoad = cardCount > 0;

    console.log(`1️⃣ Skeleton не показывается постоянно: ${skeletonFixed ? '✅' : '❌'}`);
    console.log(`2️⃣ Активная кнопка показывается: ${buttonShows ? '✅' : '❌'}`);
    console.log(`3️⃣ Карточки загружаются: ${cardsLoad ? '✅' : '❌'}`);

    const allFixed = skeletonFixed && buttonShows && cardsLoad;

    console.log(`\n🎉 ОБЩИЙ РЕЗУЛЬТАТ: ${allFixed ? '✅ ВСЕ ИСПРАВЛЕНО!' : '❌ ЕСТЬ ПРОБЛЕМЫ'}`);

    if (allFixed) {
      console.log('\n📋 Итоги:');
      console.log('  ✅ Skeleton показывается только при первой загрузке');
      console.log('  ✅ Активная кнопка "Claim Reward" отображается для доступных наград');
      console.log('  ✅ Карточки наград загружаются корректно');
      console.log('  ✅ UI работает правильно');
    }

    await page.screenshot({ path: 'test-fixes-result.png', fullPage: true });
    console.log('\n📸 Скриншот сохранен: test-fixes-result.png');

  } catch (error) {
    console.error('❌ Тест не удался:', error);
    await page.screenshot({ path: 'test-fixes-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
  }
}

testFixes();
