const { chromium } = require('playwright');

async function checkRewardsLoading() {
  console.log('🔍 ПРОВЕРКА ЗАГРУЗКИ DAILY REWARDS\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Открываем страницу
    const url = 'http://localhost:3004/daily-rewards?app=APP123&userId=test-load-rewards&appId=APP123';
    console.log(`📄 Открываем: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Проверяем наличие контента
    const pageTitle = await page.title();
    console.log(`📋 Заголовок страницы: "${pageTitle}"`);

    // Проверяем наличие карточек наград
    const rewardCards = page.locator('[style*="width: 220px"]');
    const cardCount = await rewardCards.count();
    console.log(`🎴 Найдено карточек наград: ${cardCount}`);

    let claimBtnCount = 0;
    let timerCount = 0;
    let svgCount = 0;
    let claimedCount = 0;

    if (cardCount > 0) {
      // Проверяем первую карточку
      const firstCard = rewardCards.first();
      const cardText = await firstCard.textContent();
      console.log(`🎯 Первая карточка содержит: ${cardText.substring(0, 100)}...`);

      // Проверяем наличие кнопок
      const claimButtons = page.locator('button:has-text("Claim Reward")');
      claimBtnCount = await claimButtons.count();
      console.log(`🎮 Кнопок "Claim Reward": ${claimBtnCount}`);

      // Проверяем таймеры
      const timerElements = page.locator('text=/\\d{2}:\\d{2}:\\d{2}/');
      timerCount = await timerElements.count();
      console.log(`⏰ Элементов с таймером: ${timerCount}`);

      // Проверяем замки
      const svgElements = page.locator('svg');
      svgCount = await svgElements.count();
      console.log(`🔒 SVG элементов (замки): ${svgCount}`);

      // Проверяем текст "Claimed"
      const claimedElements = page.locator('text=/Claimed/');
      claimedCount = await claimedElements.count();
      console.log(`✅ Элементов "Claimed": ${claimedCount}`);

    } else {
      console.log('❌ Карточки наград не найдены!');

      // Проверяем ошибки
      const errorElements = page.locator('text=/error|Error|failed|Failed/i');
      const errorCount = await errorElements.count();
      console.log(`🚨 Элементов с ошибками: ${errorCount}`);

      // Проверяем загрузку
      const loadingElements = page.locator('text=/loading|Loading|Loading.../i');
      const loadingCount = await loadingElements.count();
      console.log(`⏳ Элементов загрузки: ${loadingCount}`);

      // Проверяем пустую страницу
      const bodyText = await page.textContent('body');
      if (bodyText.trim().length < 100) {
        console.log('📭 Страница практически пустая');
        console.log(`📝 Содержимое страницы: "${bodyText.trim()}"`);
      }
    }

    // Делаем скриншот
    await page.screenshot({ path: 'rewards-loading-check.png', fullPage: true });
    console.log('📸 Скриншот сохранен: rewards-loading-check.png');

    // ИТОГИ
    console.log('\n🎯 РЕЗУЛЬТАТЫ ПРОВЕРКИ:');
    if (cardCount > 0) {
      console.log('✅ НАГРАДЫ ЗАГРУЖАЮТСЯ - система работает!');
      console.log(`   • Карточек наград: ${cardCount}`);
      console.log(`   • Активных кнопок: ${claimBtnCount}`);
      console.log(`   • Таймеров: ${timerCount}`);
      console.log(`   • Замков: ${svgCount}`);
    } else {
      console.log('❌ НАГРАДЫ НЕ ЗАГРУЖАЮТСЯ - проблема в системе!');
      console.log('   Возможные причины:');
      console.log('   • API не возвращает данные');
      console.log('   • Repository не обрабатывает данные');
      console.log('   • Use Case не работает');
      console.log('   • Presenter не загружает данные');
      console.log('   • UI компоненты не рендерятся');
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке:', error.message);
    await page.screenshot({ path: 'rewards-loading-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 ПРОВЕРКА ЗАВЕРШЕНА');
  }
}

checkRewardsLoading();
