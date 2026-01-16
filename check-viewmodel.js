const { chromium } = require('playwright');

async function checkViewModel() {
  console.log('🔍 CHECKING VIEWMODEL DATA\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Открываем страницу
    const url = 'http://localhost:3004/daily-rewards?app=APP123&userId=test-user-workability&appId=APP123';
    console.log(`📄 Opening: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Ждем загрузки и проверяем консоль
    console.log('📊 Checking console logs for ViewModel data...');

    // Даем время на загрузку всех логов
    await page.waitForTimeout(5000);

    // Проверяем содержимое страницы
    const pageText = await page.textContent('body');
    console.log(`📄 Page contains "Claimed": ${pageText.includes('Claimed')}`);
    console.log(`📄 Page contains timer: ${/\d{2}:\d{2}:\d{2}/.test(pageText)}`);

    // Проверяем API данные еще раз
    const apiResponse = await fetch('http://localhost:3004/api/daily-rewards/next?appId=APP123&userId=test-user-workability');
    const apiData = await apiResponse.json();

    console.log('\n🔍 API vs UI Comparison:');
    console.log(`API - canClaim: ${apiData.canClaim}`);
    console.log(`API - nextClaimDate: ${apiData.nextClaimDate}`);
    console.log(`API - lastClaimRewardId: ${apiData.lastClaimRewardId}`);
    console.log(`UI - shows "Claimed": ${pageText.includes('Claimed')}`);
    console.log(`UI - shows timer: ${/\d{2}:\d{2}:\d{2}/.test(pageText)}`);

    await page.screenshot({ path: 'viewmodel-check.png', fullPage: true });

    console.log('\n📸 Screenshot saved as viewmodel-check.png');

    // Выводим ожидаемое поведение
    console.log('\n🎯 Expected behavior:');
    console.log('- Day 1 should show "Claimed" (was claimed today)');
    console.log('- Day 2 should show timer (next available tomorrow)');
    console.log('- Other days should show locks');

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 VIEWMODEL CHECK COMPLETED');
  }
}

checkViewModel();
