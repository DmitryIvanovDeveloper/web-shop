import { describe, it, expect } from 'vitest';
import { buildOfferRuleTreeFromCatalog } from '../../domain/services';
import type { CatalogScenarioOverride } from '../../domain/services/offer-rule-tree.builder';

describe('OfferRuleTreeBuilder', () => {
  it('builds rule tree from catalog with overrides', () => {
    const overrides: Record<string, CatalogScenarioOverride> = {
      'welcome-new-user': {
        priority: 120,
        configuration: {
          offerIds: ['welcome-pack-01', 'starter-bundle'],
          metadata: { flow: 'welcome' },
        },
      },
      'vip-offer': {
        configuration: {
          offerIds: ['vip-box'],
        },
      },
    };

    const tree = buildOfferRuleTreeFromCatalog({
      appId: 'app-liveops',
      version: 'v1',
      overrides,
    });

    expect(tree.appId).toBe('app-liveops');
    expect(tree.version).toBe('v1');
    expect(tree.ruleSet).toBeDefined();
    expect(tree.scenarios.length).toBeGreaterThan(0);

    const welcomeScenario = tree.scenarios.find((scenario) => scenario.slug === 'welcome-new-user');
    expect(welcomeScenario).toBeDefined();
    expect(welcomeScenario?.offerIds).toEqual(['welcome-pack-01', 'starter-bundle']);
    expect(welcomeScenario?.priority).toBe(120);

    const vipScenario = tree.scenarios.find((scenario) => scenario.slug === 'vip-offer');
    expect(vipScenario).toBeDefined();
    expect(vipScenario?.offerIds).toEqual(['vip-box']);
  });
});


