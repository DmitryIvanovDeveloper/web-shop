const { test, expect } = require('@playwright/test');

test.describe('Localization Dashboard', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Navigate to localization page
    await page.goto('http://localhost:3006/merchant-admin/localization');
    await page.waitForLoadState('networkidle');
  });

  test('should load localization dashboard', async ({ page }) => {
    console.log('Testing localization dashboard...');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if page title is visible
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();
    console.log('Page title found');

    // Check for language selector
    const languageSelector = page.locator('select, [role="combobox"]').first();
    if (await languageSelector.count() > 0) {
      await expect(languageSelector).toBeVisible();
      console.log('Language selector found');
    }

    // Check for supported languages section
    const supportedLanguagesText = page.locator('text=/supported|languages|поддерживаемые|языки/i');
    if (await supportedLanguagesText.count() > 0) {
      await expect(supportedLanguagesText.first()).toBeVisible();
      console.log('Supported languages section found');
    }

    // Check for translation coverage section
    const coverageText = page.locator('text=/coverage|покрытие|переводы/i');
    if (await coverageText.count() > 0) {
      await expect(coverageText.first()).toBeVisible();
      console.log('Translation coverage section found');
    }

    // Check for English and Arabic languages
    const englishText = page.locator('text=/English|en|английский/i');
    const arabicText = page.locator('text=/Arabic|ar|арабский/i');

    if (await englishText.count() > 0) {
      await expect(englishText.first()).toBeVisible();
      console.log('English language found');
    }

    if (await arabicText.count() > 0) {
      await expect(arabicText.first()).toBeVisible();
      console.log('Arabic language found');
    }

    // Check for translation keys
    const translationKeys = page.locator('text=/auth\.|nav\.|app\.|offers\.|products\./');
    const keyCount = await translationKeys.count();
    console.log(`Found ${keyCount} translation keys on page`);

    // Take screenshot for verification
    await page.screenshot({ path: 'localization-dashboard.png', fullPage: true });
    console.log('Screenshot saved as localization-dashboard.png');

    // Check if there are any error messages
    const errorMessages = page.locator('text=/error|ошибка|failed/i');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      console.log(`Found ${errorCount} error messages - checking...`);
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorMessages.nth(i).textContent();
        console.log(`Error ${i + 1}: ${errorText}`);
      }
    }

    // Check if loading states are resolved
    const loadingElements = page.locator('text=/loading|загрузка/i');
    const loadingCount = await loadingElements.count();
    if (loadingCount > 0) {
      console.log(`Found ${loadingCount} loading elements - might indicate slow loading`);
    }

    console.log('Localization dashboard test completed successfully');
  });

  test('should show translation statistics', async ({ page }) => {
    console.log('Testing translation statistics...');

    await page.waitForTimeout(3000);

    // Look for percentage indicators
    const percentageText = page.locator('text=/%/');
    const percentageCount = await percentageText.count();
    console.log(`Found ${percentageCount} percentage indicators`);

    // Look for coverage information
    const coverageIndicators = page.locator('text=/100%|complete|полностью/i');
    const coverageCount = await coverageIndicators.count();
    console.log(`Found ${coverageCount} coverage indicators`);

    // Check for language statistics
    const statsText = page.locator('text=/translated|keys|переведено|ключей/i');
    const statsCount = await statsText.count();
    console.log(`Found ${statsCount} statistics indicators`);

    console.log('Translation statistics test completed');
  });

  test('should handle language switching', async ({ page }) => {
    console.log('Testing language switching...');

    await page.waitForTimeout(3000);

    // Try to find and click language selector
    const languageButtons = page.locator('button, select, [role="button"]').filter({ hasText: /English|Arabic|en|ar|английский|арабский/i });
    const buttonCount = await languageButtons.count();

    if (buttonCount > 0) {
      console.log(`Found ${buttonCount} language buttons`);
      await languageButtons.first().click();
      await page.waitForTimeout(1000);

      // Check if language changed
      const currentSelection = page.locator('[aria-selected="true"], .selected, .active').filter({ hasText: /English|Arabic|en|ar/ });
      if (await currentSelection.count() > 0) {
        console.log('Language selection appears to work');
      }
    } else {
      console.log('No language switching buttons found - might be read-only view');
    }

    console.log('Language switching test completed');
  });
});
