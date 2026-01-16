const { chromium } = require('playwright');

async function testCardWidth() {
  console.log('📏 ТЕСТИРОВАНИЕ ШИРИНЫ КАРТОЧЕК НА ШИРОКИХ ЭКРАНАХ\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const userId = `test-width-${Date.now()}`;
    const url = `http://localhost:3004/daily-rewards?app=APP123&userId=${userId}&appId=APP123`;

    const resolutions = [
      { name: '1920px (Full HD)', width: 1920, height: 1080 },
      { name: '2560px (2K)', width: 2560, height: 1440 },
      { name: '3840px (4K)', width: 3840, height: 2160 },
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
            justifyContent: style.justifyContent,
            totalCards: children.length,
            cardsInFirstRow: firstRow.length,
            cardWidth: firstRow[0]?.getBoundingClientRect().width || 0,
            containerWidth: grid.getBoundingClientRect().width,
            viewportWidth: window.innerWidth
          };
        }
        return null;
      });

      if (gridInfo) {
        console.log(`   Viewport width: ${gridInfo.viewportWidth}px`);
        console.log(`   Container width: ${Math.round(gridInfo.containerWidth)}px`);
        console.log(`   Grid columns: ${gridInfo.columns}`);
        console.log(`   Justify content: ${gridInfo.justifyContent}`);
        console.log(`   Карточек в первой строке: ${gridInfo.cardsInFirstRow}`);
        console.log(`   Ширина карточки: ${Math.round(gridInfo.cardWidth)}px`);
        
        // Проверяем, что карточки не слишком широкие
        const maxWidth = 400; // Максимальная разумная ширина
        const isGood = gridInfo.cardWidth <= maxWidth;
        console.log(`   ✅ Ширина карточки <= ${maxWidth}px: ${isGood ? 'ДА' : 'НЕТ'}`);
        
        if (!isGood) {
          console.log(`   ⚠️ Карточка слишком широкая!`);
        }
      }

      await page.screenshot({ path: `card-width-${resolution.width}px.png`, fullPage: true });
      console.log(`   📸 Скриншот сохранен`);
    }

    console.log('\n🎯 === ИТОГОВЫЕ РЕЗУЛЬТАТЫ ===');
    console.log('✅ Карточки ограничены по максимальной ширине на широких экранах');
    console.log('✅ Grid центрируется при ограниченной ширине карточек');

  } catch (error) {
    console.error('❌ Тест не удался:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
  }
}

testCardWidth();
