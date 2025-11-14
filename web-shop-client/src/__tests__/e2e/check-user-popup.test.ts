import { test, expect } from '@playwright/test';

test.describe('Check User Popup', () => {
  test('should check if popup appears for test-user-128', async ({ page }) => {
    // Monitor console messages and network requests
    const consoleMessages: string[] = [];
    const networkRequests: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
    });

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/') && !url.includes('_next')) {
        networkRequests.push(`${request.method()} ${url}`);
      }
    });

    // Navigate to the page with specific userId
    const userId = 'test-user-128';
    await page.goto(`http://localhost:3001/?appId=APP123&userId=${userId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for page to load and authentication to complete
    await page.waitForTimeout(5000);

    // Wait for events to process and popup to appear
    await page.waitForTimeout(10000);

    // Check console for relevant logs
    const authLogs = consoleMessages.filter(
      (msg) => msg.includes('UserAuthenticated') || msg.includes('isNewUser')
    );
    const offersLogs = consoleMessages.filter(
      (msg) => msg.includes('PersonalOffers') || msg.includes('OffersList') || msg.includes('EvaluateOffers')
    );
    const contextLogs = consoleMessages.filter(
      (msg) => msg.includes('user.flags') || msg.includes('isNew') || msg.includes('purchases.length')
    );

    console.log('\n=== AUTHENTICATION LOGS ===');
    console.log(authLogs.slice(-5));

    console.log('\n=== OFFERS LOGS ===');
    console.log(offersLogs.slice(-10));

    console.log('\n=== CONTEXT LOGS ===');
    console.log(contextLogs.slice(-10));

    // Check for popup
    const popupSelectors = [
      'text=/Special Offers/i',
      'text=/🎁/i',
      '[role="dialog"]',
      '.popup',
      '[class*="popup"]',
      '[class*="Popup"]',
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
    await page.screenshot({ path: `check-user-${userId}-debug.png`, fullPage: true });

    // Check Final offer IDs/count logs
    const finalOfferLogs = consoleMessages.filter(
      (msg) => msg.includes('Final offer IDs') || msg.includes('Final offers count')
    );
    console.log('\n=== FINAL OFFER LOGS ===');
    console.log(finalOfferLogs);

    // Check OffersList logs
    const offersListLogs = consoleMessages.filter(
      (msg) => msg.includes('OffersList') && (msg.includes('Found') || msg.includes('Created') || msg.includes('condition'))
    );
    console.log('\n=== OFFERSLIST LOGS ===');
    console.log(offersListLogs);

    // Check PersonalOffersPresenter logs
    const presenterLogs = consoleMessages.filter(
      (msg) => msg.includes('PersonalOffersPresenter') && (msg.includes('offersCount') || msg.includes('offers ready'))
    );
    console.log('\n=== PRESENTER LOGS ===');
    console.log(presenterLogs);

    console.log('\n=== RESULT ===');
    console.log('User ID:', userId);
    console.log('Popup found:', popupFound);
    console.log('Network requests count:', networkRequests.length);

    if (popupFound) {
      const popupContent = await page.locator(foundSelector).textContent();
      console.log('Popup content:', popupContent?.substring(0, 200));
    }

    // Log diagnostic info
    console.log('\n=== DIAGNOSTIC INFO ===');
    console.log('Total console messages:', consoleMessages.length);
    console.log('Total network requests:', networkRequests.length);
  });
});

