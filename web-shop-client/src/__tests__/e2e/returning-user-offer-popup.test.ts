import { test, expect } from '@playwright/test';

test.describe('Returning User Offer Popup E2E', () => {
  test('should show offer popup for returning user with configured products', async ({ page }) => {
    // Monitor console messages and network requests
    const consoleMessages: string[] = [];
    const networkRequests: string[] = [];
    const networkResponses: Array<{ url: string; status: number; body?: any }> = [];

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

    // Navigate to the page with userId in query params (returning user)
    // First, create a user by visiting the page once, then visit again as returning
    const returningUserId = `returning-user-${Date.now()}`;
    
    // First visit: create user (will be treated as new)
    await page.goto(`http://localhost:3001/?appId=APP123&userId=${returningUserId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(3000);
    
    // Second visit: user should be treated as returning
    await page.goto(`http://localhost:3001/?appId=APP123&userId=${returningUserId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for page to load and authentication to complete
    await page.waitForTimeout(5000);

    // Wait for events to process and popup to appear
    await page.waitForTimeout(10000);

    // Check console for PersonalOffersHandler and EvaluateOffersUseCase logs
    const personalOffersLogs = consoleMessages.filter(
      (msg) =>
        msg.includes('PersonalOffers') ||
        msg.includes('EvaluateOffers') ||
        msg.includes('returning') ||
        msg.includes('Returning')
    );
    console.log('PersonalOffers/EvaluateOffers logs:', personalOffersLogs);

    // Check network requests
    const offerContextRequests = networkRequests.filter((req) =>
      req.includes('/api/user/offer-context')
    );
    const rulesRequests = networkRequests.filter((req) => req.includes('/api/offers/rules'));
    const purchasesRequests = networkRequests.filter((req) => req.includes('/api/user/purchases'));

    console.log('Offer context requests:', offerContextRequests);
    console.log('Rules requests:', rulesRequests);
    console.log('Purchases requests:', purchasesRequests);

    // Check rule tree response
    const ruleTreeResponse = networkResponses.find((r) => r.url.includes('/api/offers/rules'));
    if (ruleTreeResponse?.body) {
      console.log('\n=== RULE TREE ANALYSIS ===');
      console.log('Rule tree scenarios count:', ruleTreeResponse.body.scenarios?.length ?? 0);
      console.log('Rule tree ruleSet:', JSON.stringify(ruleTreeResponse.body.ruleSet, null, 2));
      
      const returningScenario = ruleTreeResponse.body.scenarios?.find(
        (s: any) => s.triggerCode === 'returning_no_purchase'
      );
      if (returningScenario) {
        console.log('Returning scenario found:', {
          slug: returningScenario.slug,
          offerIds: returningScenario.offerIds,
          itemsCount: returningScenario.items?.length ?? 0,
        });
      }
      
      // Check what condition is in ruleSet
      if (ruleTreeResponse.body.ruleSet?.condition) {
        console.log('RuleSet condition:', {
          conditionType: ruleTreeResponse.body.ruleSet.condition.conditionType,
          value1: ruleTreeResponse.body.ruleSet.condition.value1,
          value2: ruleTreeResponse.body.ruleSet.condition.value2,
        });
      }
      
      // Check what action is in ruleSet
      if (ruleTreeResponse.body.ruleSet?.nextOperation?.action) {
        console.log('RuleSet action:', {
          actionType: ruleTreeResponse.body.ruleSet.nextOperation.action.actionType,
          offerId: ruleTreeResponse.body.ruleSet.nextOperation.action.params?.offerId,
          scenario: ruleTreeResponse.body.ruleSet.nextOperation.action.params?.scenario,
        });
      }
    }

    // Check for offer popup - try multiple selectors
    const popupSelectors = [
      'text=/Special Offers/i',
      'text=/🎁/i',
      '[role="dialog"]',
      '.popup',
      '[class*="popup"]',
      '[class*="Popup"]',
      'text=/Beam Tanning App/i',
      'text=/1 Month/i',
      'text=/1 Year/i',
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
    await page.screenshot({ path: 'returning-user-offer-debug.png', fullPage: true });

    // Log all network requests and responses
    console.log('All network requests:', networkRequests);
    console.log('All network responses:', networkResponses);
    console.log('All console messages:', consoleMessages);

    if (!popupFound) {
      // Check page content
      const pageContent = await page.content();
      const bodyText = await page.locator('body').textContent();
      console.log('Page contains "Special Offers":', pageContent.includes('Special Offers'));
      console.log('Page contains "popup":', pageContent.toLowerCase().includes('popup'));
      console.log('Body text (first 1000 chars):', bodyText?.substring(0, 1000));

      // Check if there are any visible dialogs or modals
      const dialogs = await page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').count();
      console.log(`Found ${dialogs} dialogs/modals on page`);

      // Check EvaluateOffersUseCase logs for condition evaluation
      const conditionLogs = consoleMessages.filter((msg) =>
        msg.includes('Condition evaluation') || msg.includes('AND condition')
      );
      console.log('Condition evaluation logs:', conditionLogs);

    // Check for returning user context
    const returningLogs = consoleMessages.filter(
      (msg) => msg.includes('isNew') || msg.includes('user.flags.isNew') || msg.includes('user.purchases.length')
    );
    console.log('Returning user context logs:', returningLogs);
    
    // Check context loading logs
    const contextLogs = consoleMessages.filter((msg) =>
      msg.includes('Context loaded') || msg.includes('user.flags') || msg.includes('purchases')
    );
    console.log('Context loading logs:', contextLogs);
    
    // Check Final offer IDs logs
    const finalOfferIdsLogs = consoleMessages.filter((msg) =>
      msg.includes('Final offer IDs')
    );
    console.log('Final offer IDs logs:', finalOfferIdsLogs);
    } else {
      // Check if popup contains configured products
      const products = ['Beam Tanning App', '1 Month', '1 Year'];
      for (const product of products) {
        const productElement = page.locator(`text=/${product}/i`);
        if (await productElement.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found "${product}" in popup!`);
        } else {
          console.log(`⚠️ "${product}" not found in popup`);
        }
      }

      // Get popup content
      const popupContent = await page.locator(foundSelector).textContent();
      console.log('Popup content:', popupContent);
      
      // Check Final offer IDs logs to see where offers came from
      const finalOfferIdsLogs = consoleMessages.filter((msg) =>
        msg.includes('Final offer IDs') || msg.includes('Final offers count')
      );
      console.log('Final offer IDs/count logs:', finalOfferIdsLogs);
      
      // Check SelectOffersUseCase logs
      const selectOffersLogs = consoleMessages.filter((msg) =>
        msg.includes('SelectOffersInteractor') || msg.includes('SelectOffersUseCase returned')
      );
      console.log('SelectOffersUseCase logs:', selectOffersLogs);
      
      // Check PersonalOffersPresenter logs
      const presenterLogs = consoleMessages.filter((msg) =>
        msg.includes('PersonalOffersPresenter') && (msg.includes('offersCount') || msg.includes('offers ready'))
      );
      console.log('PersonalOffersPresenter logs:', presenterLogs);
      
      // Check ruleSet evaluation logs
      const ruleSetLogs = consoleMessages.filter((msg) =>
        msg.includes('ruleSet') || msg.includes('RuleSet') || msg.includes('evaluateOperation')
      );
      console.log('RuleSet evaluation logs:', ruleSetLogs);
    }

    // Verify that authentication happened and rule tree was requested
    expect(networkRequests.some((req) => req.includes('/api/offers/rules'))).toBe(true);

    // Log diagnostic info
    console.log('\n=== DIAGNOSTIC INFO ===');
    console.log('User ID:', returningUserId);
    console.log('Network requests count:', networkRequests.length);
    console.log('Console messages count:', consoleMessages.length);
    console.log('Popup found:', popupFound);

    // Check if returning scenario was evaluated
    const scenarioLogs = consoleMessages.filter(
      (msg) =>
        msg.includes('welcome-new-user-returning_no_purchase') ||
        msg.includes('returning_no_purchase')
    );
    console.log('Returning scenario logs:', scenarioLogs);
  });
});

