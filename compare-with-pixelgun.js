const { chromium } = require('playwright');

async function compareWithPixelgun() {
  console.log('🔍 СРАВНЕНИЕ С PIXELGUN 3D HUB\n');

  const browser = await chromium.launch({ headless: false });
  
  // Страница 1: Pixel Gun 3D Hub (референс)
  const page1 = await browser.newPage();
  await page1.goto('https://hub.pixelgun3d.com/ru/daily-rewards', { waitUntil: 'networkidle', timeout: 30000 });
  await page1.waitForTimeout(3000);

  // Страница 2: Наша реализация
  const page2 = await browser.newPage();
  await page2.goto('http://localhost:3004/daily-rewards?app=APP123&userId=test-comparison&appId=APP123', { waitUntil: 'networkidle', timeout: 30000 });
  await page2.waitForTimeout(3000);

  const resolutions = [
    { name: 'Desktop (1920px)', width: 1920, height: 1080 },
    { name: 'Desktop (1280px)', width: 1280, height: 720 },
    { name: 'Tablet (1024px)', width: 1024, height: 768 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
  ];

  for (const resolution of resolutions) {
    console.log(`\n📐 === ${resolution.name} ===`);

    // Pixel Gun
    await page1.setViewportSize({ width: resolution.width, height: resolution.height });
    await page1.waitForTimeout(1000);

    // Подсчитываем карточки на Pixel Gun
    const pixelgunCards = await page1.evaluate(() => {
      // Ищем карточки наград (обычно это div с определенными классами)
      const cards = document.querySelectorAll('[class*="card"], [class*="reward"], [class*="item"]');
      return Array.from(cards).filter(card => {
        const rect = card.getBoundingClientRect();
        return rect.width > 100 && rect.height > 100; // Фильтруем реальные карточки
      }).length;
    });

    // Анализируем grid на Pixel Gun
    const pixelgunGrid = await page1.evaluate(() => {
      const grids = document.querySelectorAll('[style*="grid"], [class*="grid"]');
      let gridInfo = null;
      grids.forEach(grid => {
        const style = window.getComputedStyle(grid);
        if (style.display === 'grid' && style.gridTemplateColumns) {
          gridInfo = {
            columns: style.gridTemplateColumns,
            gap: style.gap,
            width: grid.getBoundingClientRect().width
          };
        }
      });
      return gridInfo;
    });

    console.log(`   Pixel Gun:`);
    console.log(`      Карточек: ${pixelgunCards}`);
    if (pixelgunGrid) {
      console.log(`      Grid columns: ${pixelgunGrid.columns}`);
      console.log(`      Gap: ${pixelgunGrid.gap}`);
    }

    // Наша реализация
    await page2.setViewportSize({ width: resolution.width, height: resolution.height });
    await page2.waitForTimeout(1000);

    const ourCards = await page2.locator('.daily-rewards-grid > div, [style*="width: 100%"]').count();

    const ourGrid = await page2.evaluate(() => {
      const grid = document.querySelector('.daily-rewards-grid');
      if (grid) {
        const style = window.getComputedStyle(grid);
        return {
          columns: style.gridTemplateColumns,
          gap: style.gap,
          width: grid.getBoundingClientRect().width
        };
      }
      return null;
    });

    console.log(`   Наша реализация:`);
    console.log(`      Карточек: ${ourCards}`);
    if (ourGrid) {
      console.log(`      Grid columns: ${ourGrid.columns}`);
      console.log(`      Gap: ${ourGrid.gap}`);
    }

    // Скриншоты
    await page1.screenshot({ path: `pixelgun-${resolution.width}px.png`, fullPage: true });
    await page2.screenshot({ path: `our-${resolution.width}px.png`, fullPage: true });
    console.log(`   📸 Скриншоты сохранены`);
  }

  // Анализ количества колонок
  console.log('\n📊 === АНАЛИЗ КОЛИЧЕСТВА КОЛОНОК ===');
  
  await page1.setViewportSize({ width: 1920, height: 1080 });
  await page1.waitForTimeout(2000);
  
  const pixelgunAnalysis = await page1.evaluate(() => {
    // Ищем контейнер с карточками
    const containers = Array.from(document.querySelectorAll('div')).filter(div => {
      const children = Array.from(div.children);
      return children.length >= 3 && children.every(child => {
        const rect = child.getBoundingClientRect();
        return rect.width > 150 && rect.height > 150;
      });
    });
    
    if (containers.length > 0) {
      const container = containers[0];
      const children = Array.from(container.children);
      const firstRow = children.filter(child => {
        const rect = child.getBoundingClientRect();
        return rect.top < 500; // Первая строка
      });
      
      return {
        totalCards: children.length,
        cardsInFirstRow: firstRow.length,
        cardWidth: firstRow[0]?.getBoundingClientRect().width || 0,
        containerWidth: container.getBoundingClientRect().width
      };
    }
    return null;
  });

  if (pixelgunAnalysis) {
    console.log(`   Pixel Gun:`);
    console.log(`      Всего карточек: ${pixelgunAnalysis.totalCards}`);
    console.log(`      Карточек в первой строке: ${pixelgunAnalysis.cardsInFirstRow}`);
    console.log(`      Ширина карточки: ${Math.round(pixelgunAnalysis.cardWidth)}px`);
    console.log(`      Ширина контейнера: ${Math.round(pixelgunAnalysis.containerWidth)}px`);
  }

  await page2.setViewportSize({ width: 1920, height: 1080 });
  await page2.waitForTimeout(2000);

  const ourAnalysis = await page2.evaluate(() => {
    const grid = document.querySelector('.daily-rewards-grid');
    if (grid) {
      const children = Array.from(grid.children);
      const firstRow = children.filter(child => {
        const rect = child.getBoundingClientRect();
        return rect.top < 500;
      });
      
      return {
        totalCards: children.length,
        cardsInFirstRow: firstRow.length,
        cardWidth: firstRow[0]?.getBoundingClientRect().width || 0,
        containerWidth: grid.getBoundingClientRect().width
      };
    }
    return null;
  });

  if (ourAnalysis) {
    console.log(`   Наша реализация:`);
    console.log(`      Всего карточек: ${ourAnalysis.totalCards}`);
    console.log(`      Карточек в первой строке: ${ourAnalysis.cardsInFirstRow}`);
    console.log(`      Ширина карточки: ${Math.round(ourAnalysis.cardWidth)}px`);
    console.log(`      Ширина контейнера: ${Math.round(ourAnalysis.containerWidth)}px`);
  }

  console.log('\n🎯 === РЕКОМЕНДАЦИИ ===');
  if (pixelgunAnalysis && ourAnalysis) {
    const pixelgunCols = pixelgunAnalysis.cardsInFirstRow;
    const ourCols = ourAnalysis.cardsInFirstRow;
    
    console.log(`   Pixel Gun показывает: ${pixelgunCols} колонок`);
    console.log(`   Мы показываем: ${ourCols} колонок`);
    
    if (pixelgunCols !== ourCols) {
      console.log(`   ⚠️ Нужно изменить количество колонок с ${ourCols} на ${pixelgunCols}`);
    }
    
    const pixelgunCardWidth = pixelgunAnalysis.cardWidth;
    const ourCardWidth = ourAnalysis.cardWidth;
    
    if (Math.abs(pixelgunCardWidth - ourCardWidth) > 50) {
      console.log(`   ⚠️ Ширина карточек отличается: Pixel Gun ${Math.round(pixelgunCardWidth)}px, мы ${Math.round(ourCardWidth)}px`);
    }
  }

  await browser.close();
  console.log('\n🏁 СРАВНЕНИЕ ЗАВЕРШЕНО');
}

compareWithPixelgun();
