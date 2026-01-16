const { chromium } = require('playwright');

async function testResponsiveGrid() {
  console.log('📱 ТЕСТИРОВАНИЕ АДАПТИВНОЙ СЕТКИ НА РАЗНЫХ РАЗРЕШЕНИЯХ\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const userId = `test-responsive-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`👤 Тестируем с пользователем: ${userId}\n`);

    // Разрешения для тестирования
    const resolutions = [
      { name: 'Mobile (375px)', width: 375, height: 667 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Desktop (1024px)', width: 1024, height: 768 },
      { name: 'Large Desktop (1280px)', width: 1280, height: 720 },
      { name: 'XL Desktop (1536px)', width: 1536, height: 864 },
    ];

    for (const resolution of resolutions) {
      console.log(`\n📐 === ${resolution.name} ===`);
      
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Проверяем количество колонок
      const gridElement = page.locator('.daily-rewards-grid');
      const gridStyle = await gridElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          gridTemplateColumns: computed.gridTemplateColumns,
          gap: computed.gap,
        };
      });

      console.log(`   Grid columns: ${gridStyle.gridTemplateColumns}`);
      console.log(`   Gap: ${gridStyle.gap}`);

      // Подсчитываем видимые карточки
      const cards = page.locator('[style*="width: 100%"], [style*="maxWidth: 220px"]');
      const cardCount = await cards.count();
      console.log(`   Видимых карточек: ${cardCount}`);

      // Проверяем ширину первой карточки
      if (cardCount > 0) {
        const firstCard = cards.first();
        const cardWidth = await firstCard.evaluate((el) => el.getBoundingClientRect().width);
        console.log(`   Ширина карточки: ${Math.round(cardWidth)}px`);
        
        // Ожидаемое количество колонок
        let expectedColumns = 1;
        if (resolution.width >= 1536) expectedColumns = 6;
        else if (resolution.width >= 1280) expectedColumns = 5;
        else if (resolution.width >= 1024) expectedColumns = 4;
        else if (resolution.width >= 768) expectedColumns = 3;
        else if (resolution.width >= 480) expectedColumns = 2;
        else expectedColumns = 1;

        const containerWidth = await page.evaluate(() => {
          const container = document.querySelector('[style*="maxWidth: 1200px"]');
          return container ? container.getBoundingClientRect().width : window.innerWidth;
        });

        const expectedCardWidth = (containerWidth - (expectedColumns - 1) * 16) / expectedColumns;
        console.log(`   Ожидаемая ширина карточки: ${Math.round(expectedCardWidth)}px`);
        console.log(`   Ожидаемое кол-во колонок: ${expectedColumns}`);

        const widthMatch = Math.abs(cardWidth - expectedCardWidth) < 10;
        console.log(`   ✅ Соответствие: ${widthMatch ? 'ДА' : 'НЕТ'}`);
      }

      // Скриншот для каждого разрешения
      const screenshotName = `responsive-${resolution.width}px.png`;
      await page.screenshot({ path: screenshotName, fullPage: true });
      console.log(`   📸 Скриншот: ${screenshotName}`);
    }

    console.log('\n🎯 === ИТОГОВЫЕ РЕЗУЛЬТАТЫ ===');
    console.log('✅ Адаптивная сетка протестирована на всех разрешениях');
    console.log('📸 Скриншоты сохранены для каждого разрешения');

  } catch (error) {
    console.error('❌ Тест не удался:', error);
    await page.screenshot({ path: 'responsive-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
  }
}

testResponsiveGrid();
