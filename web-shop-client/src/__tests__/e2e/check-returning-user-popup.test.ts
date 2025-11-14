import { test, expect } from '@playwright/test';

test.describe('Check Returning User Popup', () => {
  test('should check if popup appears for existing returning user test-user-123', async ({ page }) => {
    // Monitor console messages and network requests
    const consoleMessages: string[] = [];
    const networkRequests: string[] = [];
    const networkResponses: Array<{ url: string; status: number; body?: any }> = [];

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

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/') && !url.includes('_next')) {
        try {
          const body = await response.json().catch(() => null);
          networkResponses.push({
            url,
            status: response.status(),
            body,
          });
        } catch (e) {
          networkResponses.push({
            url,
            status: response.status(),
          });
        }
      }
    });

    // Navigate to the page with existing userId
    const userId = 'test-user-123';
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
      (msg) => msg.includes('UserAuthenticated') || msg.includes('isNewUser') || msg.includes('UserReturned')
    );
    const offersLogs = consoleMessages.filter(
      (msg) => msg.includes('PersonalOffers') || msg.includes('OffersList') || msg.includes('EvaluateOffers') || msg.includes('returning')
    );
    const contextLogs = consoleMessages.filter(
      (msg) => msg.includes('user.flags') || msg.includes('isNew') || msg.includes('purchases.length')
    );

    console.log('\n=== AUTHENTICATION LOGS ===');
    console.log(authLogs.slice(-10));

    console.log('\n=== OFFERS LOGS ===');
    console.log(offersLogs.slice(-15));

    console.log('\n=== CONTEXT LOGS ===');
    console.log(contextLogs.slice(-15));

    // Check rule tree response for returning scenarios
    const ruleTreeResponse = networkResponses.find((r) => r.url.includes('/api/offers/rules'));
    if (ruleTreeResponse?.body) {
      console.log('\n=== RULE TREE ANALYSIS ===');
      const returningScenarios = ruleTreeResponse.body.scenarios?.filter((s: any) => 
        s.triggerCode === 'returning_no_purchase'
      ) || [];
      console.log('Returning scenarios found:', returningScenarios.map((s: any) => ({
        slug: s.slug,
        triggerCode: s.triggerCode,
        offerIds: s.offerIds,
        itemsCount: s.items?.length ?? 0,
      })));
    }

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
    await page.screenshot({ path: `check-returning-user-${userId}-debug.png`, fullPage: true });

    // Check Final offer IDs/count logs
    const finalOfferLogs = consoleMessages.filter(
      (msg) => msg.includes('Final offer IDs') || msg.includes('Final offers count')
    );
    console.log('\n=== FINAL OFFER LOGS ===');
    console.log(finalOfferLogs);

    // Check OffersList logs
    const offersListLogs = consoleMessages.filter(
      (msg) => msg.includes('OffersList') && (msg.includes('Found') || msg.includes('Created') || msg.includes('condition') || msg.includes('isNew'))
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
      console.log('Popup content:', popupContent?.substring(0, 300));
    }

    // Log diagnostic info
    console.log('\n=== DIAGNOSTIC INFO ===');
    console.log('Total console messages:', consoleMessages.length);
    console.log('Total network requests:', networkRequests.length);
  });
});

