import { test, expect } from '@playwright/test';

test.describe('Merchant Admin Offers - Checkbox Functionality', () => {
  test('should allow checking and unchecking all products for a scenario condition', async ({ page }) => {
    // Navigate to merchant admin offers page
    await page.goto('http://localhost:3000/merchant-admin/offers?appId=APP123', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for scenarios to load
    await page.waitForSelector('[data-testid="scenario-list"]', { timeout: 10000 }).catch(() => {
      // Fallback: wait for any scenario item
      return page.waitForSelector('text=Welcome Offer', { timeout: 10000 });
    });

    // Click on "Welcome Offer" scenario
    await page.click('text=Welcome Offer');

    // Wait for scenario details to load
    await page.waitForSelector('text=Products by Condition', { timeout: 10000 });

    // Find all product checkboxes
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    
    if (checkboxes.length === 0) {
      test.skip('No products available to test');
      return;
    }

    // Check all checkboxes
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }

    // Wait a bit for state to update
    await page.waitForTimeout(500);

    // Verify all checkboxes are checked
    for (const checkbox of checkboxes) {
      await expect(checkbox).toBeChecked();
    }

    // Uncheck all checkboxes
    for (const checkbox of checkboxes) {
      await checkbox.uncheck();
    }

    // Wait a bit for state to update
    await page.waitForTimeout(500);

    // Verify all checkboxes are unchecked
    for (const checkbox of checkboxes) {
      await expect(checkbox).not.toBeChecked();
    }

    // Check one checkbox again to verify it works after unchecking all
    if (checkboxes.length > 0) {
      await checkboxes[0].check();
      await page.waitForTimeout(500);
      await expect(checkboxes[0]).toBeChecked();
    }
  });

  test('should persist checkbox state after page reload', async ({ page }) => {
    // Navigate to merchant admin offers page
    await page.goto('http://localhost:3000/merchant-admin/offers?appId=APP123', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for scenarios to load
    await page.waitForSelector('text=Welcome Offer', { timeout: 10000 });

    // Click on "Welcome Offer" scenario
    await page.click('text=Welcome Offer');

    // Wait for scenario details to load
    await page.waitForSelector('text=Products by Condition', { timeout: 10000 });

    // Find first product checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    
    if ((await firstCheckbox.count()) === 0) {
      test.skip('No products available to test');
      return;
    }

    // Check first checkbox
    await firstCheckbox.check();
    await page.waitForTimeout(1000); // Wait for save

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Wait for scenarios to load again
    await page.waitForSelector('text=Welcome Offer', { timeout: 10000 });

    // Click on "Welcome Offer" scenario again
    await page.click('text=Welcome Offer');

    // Wait for scenario details to load
    await page.waitForSelector('text=Products by Condition', { timeout: 10000 });

    // Verify checkbox is still checked
    const firstCheckboxAfterReload = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckboxAfterReload).toBeChecked();
  });
});

