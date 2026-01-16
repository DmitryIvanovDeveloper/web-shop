const { chromium } = require('playwright');

async function testPlaywrightFixes() {
  console.log('🎭 PLAYWRIGHT ТЕСТ: ПРОВЕРКА ИСПРАВЛЕНИЙ\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Создаем нового пользователя для чистого теста
    const userId = `playwright-test-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`👤 Тестируем с пользователем: ${userId}`);
    console.log(`📄 URL: ${url}\n`);

    // 1. ПРОВЕРКА SKELETON
    console.log('1️⃣ === ПРОВЕРКА SKELETON ===');
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Ждем немного для загрузки
    await page.waitForTimeout(3000);

    // Проверяем наличие skeleton элементов
    const skeletonSelectors = [
      '[class*="skeleton"]',
      '[class*="Skeleton"]',
      '[data-testid*="skeleton"]',
      '[aria-label*="loading"]'
    ];

    let skeletonFound = false;
    for (const selector of skeletonSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        skeletonFound = true;
        console.log(`   ⚠️ Найден skeleton с селектором: ${selector} (${elements} элементов)`);
      }
    }

    if (!skeletonFound) {
      console.log('   ✅ Skeleton не найден после загрузки - ИСПРАВЛЕНО!');
    } else {
      console.log('   ❌ Skeleton все еще показывается - ПРОБЛЕМА!');
    }

    // 2. ПРОВЕРКА ЗАГРУЗКИ КАРТОЧЕК
    console.log('\n2️⃣ === ПРОВЕРКА ЗАГРУЗКИ КАРТОЧЕК ===');

    const rewardCards = page.locator('[style*="width: 220px"], [style*="width:220px"]');
    const cardCount = await rewardCards.count();
    console.log(`   🎴 Карточек наград найдено: ${cardCount}`);

    if (cardCount > 0) {
      console.log('   ✅ Карточки загружаются - РАБОТАЕТ!');
      
      // Проверяем первую карточку
      const firstCard = rewardCards.first();
      const cardText = await firstCard.textContent();
      console.log(`   📝 Первая карточка содержит: "${cardText?.substring(0, 80)}..."`);
    } else {
      console.log('   ❌ Карточки не загружаются - ПРОБЛЕМА!');
    }

    // 3. ПРОВЕРКА АКТИВНОЙ КНОПКИ
    console.log('\n3️⃣ === ПРОВЕРКА АКТИВНОЙ КНОПКИ ===');

    // Ждем еще немного для полной загрузки
    await page.waitForTimeout(2000);

    // Ищем кнопку "Claim Reward"
    const claimButtonSelectors = [
      'button:has-text("Claim Reward")',
      'button:has-text("🎁")',
      'button[disabled="false"]:has-text("Claim")'
    ];

    let claimButtonFound = false;
    let claimButtonCount = 0;
    let claimButtonDisabled = true;

    for (const selector of claimButtonSelectors) {
      const buttons = page.locator(selector);
      const count = await buttons.count();
      if (count > 0) {
        claimButtonFound = true;
        claimButtonCount = count;
        const firstButton = buttons.first();
        claimButtonDisabled = await firstButton.isDisabled();
        const buttonText = await firstButton.textContent();
        console.log(`   🎮 Найдена кнопка с селектором: ${selector}`);
        console.log(`   📝 Текст кнопки: "${buttonText?.trim()}"`);
        console.log(`   🔓 Кнопка disabled: ${claimButtonDisabled}`);
        break;
      }
    }

    if (claimButtonFound && !claimButtonDisabled) {
      console.log('   ✅ Активная кнопка "Claim Reward" найдена и доступна - ИСПРАВЛЕНО!');
    } else if (claimButtonFound && claimButtonDisabled) {
      console.log('   ⚠️ Кнопка найдена, но disabled - ПРОБЛЕМА!');
    } else {
      console.log('   ❌ Активная кнопка не найдена - ПРОБЛЕМА!');
      
      // Проверяем, может быть кнопка есть, но с другим текстом
      const allButtons = page.locator('button');
      const allButtonsCount = await allButtons.count();
      console.log(`   🔍 Всего кнопок на странице: ${allButtonsCount}`);
      
      if (allButtonsCount > 0) {
        const firstButton = allButtons.first();
        const firstButtonText = await firstButton.textContent();
        const firstButtonDisabled = await firstButton.isDisabled();
        console.log(`   📝 Первая кнопка: "${firstButtonText?.trim()}" (disabled: ${firstButtonDisabled})`);
      }
    }

    // 4. ПРОВЕРКА API ДАННЫХ
    console.log('\n4️⃣ === ПРОВЕРКА API ДАННЫХ ===');

    try {
      const apiResponse = await page.evaluate(async (userId) => {
        const response = await fetch(`http://localhost:3004/api/daily-rewards/next?appId=APP123&userId=${userId}`);
        return await response.json();
      }, userId);

      console.log(`   📊 API Response:`);
      console.log(`      Reward: ${apiResponse.reward ? `${apiResponse.reward.title} (Day ${apiResponse.reward.day_number})` : 'None'}`);
      console.log(`      Can Claim: ${apiResponse.canClaim}`);
      console.log(`      Next Claim Date: ${apiResponse.nextClaimDate || 'None'}`);

      if (apiResponse.reward && apiResponse.canClaim) {
        console.log('   ✅ API возвращает доступную награду - РАБОТАЕТ!');
        
        // Проверяем, что эта награда активна в UI
        const rewardId = apiResponse.reward.id;
        const rewardCard = page.locator(`[data-reward-id="${rewardId}"], [id*="${rewardId}"]`);
        const cardExists = await rewardCard.count() > 0;
        
        if (cardExists) {
          console.log(`   ✅ Карточка награды найдена в UI`);
        } else {
          console.log(`   ⚠️ Карточка награды не найдена в UI (может быть другой селектор)`);
        }
      } else {
        console.log('   ⚠️ API не возвращает доступную награду');
      }
    } catch (error) {
      console.log(`   ❌ Ошибка при проверке API: ${error.message}`);
    }

    // 5. ПРОВЕРКА СОСТОЯНИЙ НАГРАД
    console.log('\n5️⃣ === ПРОВЕРКА СОСТОЯНИЙ НАГРАД ===');

    const activeBadges = page.locator('text=/Active/i');
    const inactiveBadges = page.locator('text=/Inactive/i');
    const activeCount = await activeBadges.count();
    const inactiveCount = await inactiveBadges.count();

    console.log(`   📊 Badges:`);
    console.log(`      Active: ${activeCount}`);
    console.log(`      Inactive: ${inactiveCount}`);

    // Проверяем таймеры
    const timerPattern = /\d{2}:\d{2}:\d{2}/;
    const pageText = await page.textContent('body');
    const hasTimer = timerPattern.test(pageText || '');
    console.log(`   ⏰ Таймеры: ${hasTimer ? 'Найдены' : 'Не найдены'}`);

    // Проверяем замки
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log(`   🔒 SVG элементов (замки): ${svgCount}`);

    // 6. ИТОГОВЫЕ РЕЗУЛЬТАТЫ
    console.log('\n🎯 === ИТОГОВЫЕ РЕЗУЛЬТАТЫ ===');

    const skeletonFixed = !skeletonFound;
    const cardsLoad = cardCount > 0;
    const buttonShows = claimButtonFound && !claimButtonDisabled;

    console.log(`1️⃣ Skeleton не показывается постоянно: ${skeletonFixed ? '✅ ИСПРАВЛЕНО' : '❌ ПРОБЛЕМА'}`);
    console.log(`2️⃣ Карточки загружаются: ${cardsLoad ? '✅ РАБОТАЕТ' : '❌ ПРОБЛЕМА'}`);
    console.log(`3️⃣ Активная кнопка показывается: ${buttonShows ? '✅ ИСПРАВЛЕНО' : '❌ ПРОБЛЕМА'}`);

    const allFixed = skeletonFixed && cardsLoad && buttonShows;

    console.log(`\n🎉 ОБЩИЙ РЕЗУЛЬТАТ: ${allFixed ? '✅ ВСЕ ИСПРАВЛЕНО!' : '❌ ЕСТЬ ПРОБЛЕМЫ'}`);

    if (allFixed) {
      console.log('\n📋 Итоги:');
      console.log('  ✅ Skeleton показывается только при первой загрузке');
      console.log('  ✅ Карточки наград загружаются корректно');
      console.log('  ✅ Активная кнопка "Claim Reward" отображается для доступных наград');
      console.log('  ✅ UI работает правильно');
    } else {
      console.log('\n⚠️ Обнаружены проблемы:');
      if (!skeletonFixed) console.log('  - Skeleton показывается постоянно');
      if (!cardsLoad) console.log('  - Карточки не загружаются');
      if (!buttonShows) console.log('  - Активная кнопка не показывается');
    }

    // Скриншот
    await page.screenshot({ path: 'playwright-fixes-result.png', fullPage: true });
    console.log('\n📸 Скриншот сохранен: playwright-fixes-result.png');

  } catch (error) {
    console.error('❌ Тест не удался:', error);
    await page.screenshot({ path: 'playwright-fixes-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 PLAYWRIGHT ТЕСТ ЗАВЕРШЕН');
  }
}

testPlaywrightFixes();
