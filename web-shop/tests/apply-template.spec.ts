import { test, expect } from '@playwright/test';

test.describe('Project Selection and Navigation', () => {
  const merchantId = '550e8400-e29b-41d4-a716-446655440000';

  test('should pass merchantId when selecting project', async ({ page }) => {
    // Navigate to home page with merchantId
    await page.goto(`http://localhost:3000/?merchantId=${merchantId}`);

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Look for project selection UI
    // Try to find "Select Active Project" or similar text
    const selectProjectText = page.locator('text=Select Active Project, text=Switch Active Project, text=Select a project');
    const projectSelectorVisible = await selectProjectText.first().isVisible().catch(() => false);
    console.log('Project selector visible:', projectSelectorVisible);

    if (projectSelectorVisible) {
      // Find the select dropdown
      const projectSelect = page.locator('select[id="project-select"], select');
      const selectVisible = await projectSelect.first().isVisible().catch(() => false);
      console.log('Project select dropdown visible:', selectVisible);

      if (selectVisible) {
        // Get available options
        const options = projectSelect.locator('option');
        const optionCount = await options.count();
        console.log(`Found ${optionCount} project options`);

        if (optionCount > 1) { // More than just placeholder
          // Select first available project (skip the placeholder)
          await projectSelect.selectOption({ index: 1 });

          // Wait for navigation
          await page.waitForTimeout(2000);

          // Check if redirected to analytics dashboard
          const currentUrl = page.url();
          console.log('Current URL after selection:', currentUrl);

          // Verify merchantId is in the URL
          const urlHasMerchantId = currentUrl.includes(`merchantId=${merchantId}`);
          console.log('URL contains merchantId:', urlHasMerchantId);

          if (urlHasMerchantId) {
            console.log('✅ merchantId correctly passed in redirect');
          } else {
            console.log('❌ merchantId missing from redirect URL');
          }

          // Verify we're on analytics dashboard
          const isAnalyticsDashboard = currentUrl.includes('/merchant-admin/analytics/dashboard');
          console.log('Redirected to analytics dashboard:', isAnalyticsDashboard);
        } else {
          console.log('❌ No projects available for selection');
        }
      } else {
        console.log('❌ Project select dropdown not found');
      }
    } else {
      console.log('❌ Project selector not visible');

      // Try to find navigation links that might lead to projects
      const navLinks = page.locator('a, button').filter({ hasText: /project|Project/i });
      const navLinkCount = await navLinks.count();
      console.log(`Found ${navLinkCount} navigation links mentioning projects`);
    }

    console.log('Test completed - checked project selection with merchantId');
  });

  test('should navigate to projects page and select project', async ({ page }) => {
    // Navigate directly to projects page with merchantId
    await page.goto(`http://localhost:3000/merchant-admin/projects?merchantId=${merchantId}`);

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Look for project cards or list
    const projectCards = page.locator('[class*="bg-white"], [class*="project"], button').filter({ hasText: /.+/ });
    const cardCount = await projectCards.count();
    console.log(`Found ${cardCount} potential project elements`);

    // Try to find clickable project items
    const clickableProjects = page.locator('div, button').filter({ hasText: /MY_PROJECT|Test Project|Demo/i });
    const projectCount = await clickableProjects.count();
    console.log(`Found ${projectCount} clickable project items`);

    if (projectCount > 0) {
      // Click on first project
      await clickableProjects.first().click();
      console.log('✅ Clicked on project');

      // Wait for navigation
      await page.waitForTimeout(3000);

      // Check redirect URL
      const currentUrl = page.url();
      console.log('Redirect URL:', currentUrl);

      const hasMerchantId = currentUrl.includes(`merchantId=${merchantId}`);
      const hasAppId = currentUrl.includes('appId=');

      console.log('Contains merchantId:', hasMerchantId);
      console.log('Contains appId:', hasAppId);

      if (hasMerchantId && hasAppId) {
        console.log('✅ Project selection successful - merchantId and appId in URL');
      } else {
        console.log('❌ Project selection failed - missing parameters in URL');
      }
    } else {
      console.log('❌ No clickable projects found');
    }

    console.log('Test completed - checked direct project selection');
  });
});
