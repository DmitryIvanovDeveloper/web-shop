const { chromium } = require('playwright');

async function checkPixelgunWidth() {
  console.log('🔍 ПРОВЕРКА ШИРИНЫ КАРТОЧЕК НА PIXELGUN 3D HUB\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Открываем Pixel Gun 3D Hub
    await page.goto('https://hub.pixelgun3d.com/ru/daily-rewards', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    await page.waitForTimeout(5000);

    const resolutions = [
      { name: '1920px', width: 1920, height: 1080 },
      { name: '2560px', width: 2560, height: 1440 },
    ];

    for (const resolution of resolutions) {
      console.log(`\n📐 === ${resolution.name} ===`);
      
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.waitForTimeout(2000);

      const analysis = await page.evaluate(() => {
        // Ищем карточки наград
        const allDivs = Array.from(document.querySelectorAll('div'));
        const cards = allDivs.filter(div => {
          const rect = div.getBoundingClientRect();
          const style = window.getComputedStyle(div);
          // Ищем элементы, которые похожи на карточки наград
          return rect.width > 200 && rect.width < 500 && 
                 rect.height > 150 && rect.height < 400 &&
                 style.display !== 'none';
        });

        if (cards.length > 0) {
          const firstRow = cards.filter(card => {
            const rect = card.getBoundingClientRect();
            return rect.top < 600; // Первая строка
          });

          return {
            totalCards: cards.length,
            cardsInFirstRow: firstRow.length,
            cardWidth: firstRow[0]?.getBoundingClientRect().width || 0,
            cardHeight: firstRow[0]?.getBoundingClientRect().height || 0,
            containerWidth: document.body.getBoundingClientRect().width
          };
        }
        return null;
      });

      if (analysis) {
        console.log(`   Всего карточек: ${analysis.totalCards}`);
        console.log(`   Карточек в первой строке: ${analysis.cardsInFirstRow}`);
        console.log(`   Ширина карточки: ${Math.round(analysis.cardWidth)}px`);
        console.log(`   Высота карточки: ${Math.round(analysis.cardHeight)}px`);
        console.log(`   Ширина контейнера: ${Math.round(analysis.containerWidth)}px`);
      } else {
        console.log('   ⚠️ Не удалось найти карточки');
      }

      await page.screenshot({ path: `pixelgun-${resolution.width}px.png`, fullPage: true });
      console.log(`   📸 Скриншот сохранен`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 ПРОВЕРКА ЗАВЕРШЕНА');
  }
}

checkPixelgunWidth();
