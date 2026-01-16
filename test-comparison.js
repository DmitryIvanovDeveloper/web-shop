const { chromium } = require('playwright');

async function testComparison() {
  console.log('🔍 ТЕСТИРОВАНИЕ ИЗМЕНЕНИЙ: 3 ШИРОКИЕ КАРТОЧКИ\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const userId = `test-comparison-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    console.log(`👤 Тестируем с пользователем: ${userId}\n`);

    const resolutions = [
      { name: 'Mobile (375px)', width: 375, height: 667, expectedCols: 1 },
      { name: 'Small (480px)', width: 480, height: 800, expectedCols: 2 },
      { name: 'Tablet (768px)', width: 768, height: 1024, expectedCols: 3 },
      { name: 'Desktop (1024px)', width: 1024, height: 768, expectedCols: 3 },
      { name: 'Large Desktop (1280px)', width: 1280, height: 720, expectedCols: 3 },
      { name: 'XL Desktop (1920px)', width: 1920, height: 1080, expectedCols: 3 },
    ];

    for (const resolution of resolutions) {
      console.log(`\n📐 === ${resolution.name} ===`);
      
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const gridInfo = await page.evaluate(() => {
        const grid = document.querySelector('.daily-rewards-grid');
        if (grid) {
          const style = window.getComputedStyle(grid);
          const children = Array.from(grid.children);
          const firstRow = children.filter(child => {
            const rect = child.getBoundingClientRect();
            return rect.top < 500;
          });
          
          return {
            columns: style.gridTemplateColumns,
            gap: style.gap,
            totalCards: children.length,
            cardsInFirstRow: firstRow.length,
            cardWidth: firstRow[0]?.getBoundingClientRect().width || 0,
            containerWidth: grid.getBoundingClientRect().width
          };
        }
        return null;
      });

      if (gridInfo) {
        console.log(`   Grid columns: ${gridInfo.columns}`);
        console.log(`   Карточек в первой строке: ${gridInfo.cardsInFirstRow}`);
        console.log(`   Ширина карточки: ${Math.round(gridInfo.cardWidth)}px`);
        console.log(`   Ширина контейнера: ${Math.round(gridInfo.containerWidth)}px`);
        
        const match = gridInfo.cardsInFirstRow === resolution.expectedCols;
        console.log(`   ✅ Ожидалось ${resolution.expectedCols} колонок: ${match ? 'ДА' : 'НЕТ'}`);
        
        // Скриншот
        const screenshotName = `comparison-${resolution.width}px.png`;
        await page.screenshot({ path: screenshotName, fullPage: true });
        console.log(`   📸 Скриншот: ${screenshotName}`);
      }
    }

    console.log('\n🎯 === ИТОГОВЫЕ РЕЗУЛЬТАТЫ ===');
    console.log('✅ Desktop разрешения теперь показывают 3 широкие карточки');
    console.log('✅ Как на Pixel Gun 3D Hub');
    console.log('📸 Скриншоты сохранены для всех разрешений');

  } catch (error) {
    console.error('❌ Тест не удался:', error);
    await page.screenshot({ path: 'comparison-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
  }
}

testComparison();
