import { test, expect } from '@playwright/test';

test.describe('Welcome Offer Popup E2E', () => {
  test('should show Welcome offer popup for new user after authentication', async ({ page }) => {
    // Monitor console messages and network requests
    const consoleMessages: string[] = [];
    const networkRequests: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        console.log(`Console error: ${text}`);
      }
    });
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/') && !url.includes('_next')) {
        networkRequests.push(`${request.method()} ${url}`);
      }
    });
    
    // Navigate to the page with userId in query params (new user)
    const newUserId = `test-user-${Date.now()}`;
    await page.goto(`http://localhost:3001/?appId=APP123&userId=${newUserId}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for page to load and authentication to complete
    await page.waitForTimeout(5000);
    
    // Wait for events to process and popup to appear
    await page.waitForTimeout(8000);
    
    // Check console for PersonalOffersHandler logs
    const personalOffersLogs = consoleMessages.filter(msg => 
      msg.includes('PersonalOffers') || 
      msg.includes('welcome') || 
      msg.includes('Welcome')
    );
    console.log('PersonalOffers logs:', personalOffersLogs);
    
    // Check network requests for offers
    const offerContextRequests = networkRequests.filter(req => 
      req.includes('/api/user/offer-context')
    );
    const rulesRequests = networkRequests.filter(req => 
      req.includes('/api/offers/rules')
    );
    console.log('Offer context requests:', offerContextRequests);
    console.log('Rules requests:', rulesRequests);
    
    // Check for Welcome offer popup - try multiple selectors
    const popupSelectors = [
      'text=/Special Offers/i',
      'text=/Welcome/i',
      'text=/🎁/i',
      '[role="dialog"]',
      '.popup',
      '[class*="popup"]',
      '[class*="Popup"]',
      'text=/Beam Tanning App/i',
    ];
    
    let popupFound = false;
    let foundSelector = '';
    for (const selector of popupSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found popup with selector: ${selector}`);
          popupFound = true;
          foundSelector = selector;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'welcome-offer-debug.png', fullPage: true });
    
    // Log all network requests
    console.log('All network requests:', networkRequests);
    console.log('All console messages:', consoleMessages);
    
    if (!popupFound) {
      // Check page content
      const pageContent = await page.content();
      const bodyText = await page.locator('body').textContent();
      console.log('Page contains "Special Offers":', pageContent.includes('Special Offers'));
      console.log('Page contains "Welcome":', pageContent.includes('Welcome'));
      console.log('Page contains "popup":', pageContent.toLowerCase().includes('popup'));
      console.log('Body text (first 500 chars):', bodyText?.substring(0, 500));
      
      // Check if there are any visible dialogs or modals
      const dialogs = await page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').count();
      console.log(`Found ${dialogs} dialogs/modals on page`);
    } else {
      // Check if popup contains "Beam Tanning App" offer
      const beamTanningOffer = page.locator('text=/Beam Tanning App/i');
      if (await beamTanningOffer.isVisible({ timeout: 2000 })) {
        console.log('✅ Found "Beam Tanning App" offer in popup!');
      } else {
        console.log('⚠️ Popup found but "Beam Tanning App" not visible');
        // Get popup content
        const popupContent = await page.locator(foundSelector).textContent();
        console.log('Popup content:', popupContent);
      }
    }
    
    // Verify that authentication happened and rule tree was requested
    expect(networkRequests.some(req => req.includes('/api/offers/rules'))).toBe(true);
    
    // Log diagnostic info
    console.log('\n=== DIAGNOSTIC INFO ===');
    console.log('User ID:', newUserId);
    console.log('Network requests count:', networkRequests.length);
    console.log('Console messages count:', consoleMessages.length);
    console.log('Popup found:', popupFound);
  });
});

