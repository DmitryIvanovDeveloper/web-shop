import { OfferRuleTreeBuildError } from '../errors/offer-rule-tree.error';
import { OfferScenario, type OfferScenarioProps } from '../entities/offer-scenario.entity';
import type { OfferRuleTree } from '../types/offer-rule-tree.type';
import type { OfferRuleSet, Condition, ValueDescriptor } from '../types/offer-rule-set.type';
import type { OfferItemProps } from '../value-objects/offer-item.value-object';
import type { OfferTriggerCode } from '../value-objects/offer-trigger.value-object';
import { OFFER_SCENARIO_CATALOG } from '../constants/offer-scenario-catalog';
import {
  OfferScenarioConfigurationError,
  OfferScenarioValidationError,
} from '../errors/offer-scenario.error';
import type { OfferScenarioConfigurationProps } from '../entities/offer-scenario-configuration.entity';

export interface BuildOfferRuleTreeInput {
  readonly appId: string;
  readonly version: string;
  readonly scenarios: readonly OfferScenario[];
}

export interface CatalogScenarioOverride {
  readonly priority?: number;
  readonly tags?: readonly string[];
  readonly configuration?: OfferScenarioConfigurationProps;
}

export interface BuildRuleTreeFromCatalogInput {
  readonly appId: string;
  readonly version: string;
  readonly overrides?: Record<string, CatalogScenarioOverride | undefined>;
}

const valueDescriptor = (type: ValueDescriptor['type'], value: ValueDescriptor['value']): ValueDescriptor => ({
  type,
  value,
});

const propertyDescriptor = (path: string): ValueDescriptor => valueDescriptor('property', path);

const valueLiteral = (value: ValueDescriptor['value']): ValueDescriptor => valueDescriptor('value', value);

const TRIGGER_CONDITIONS: Record<OfferTriggerCode, () => Condition> = {
  new_user_welcome: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('user.flags.isNew'),
    value2: valueLiteral(true),
  }),
  returning_no_purchase: () => ({
    conditionType: 'and',
    conditions: [
      {
        conditionType: 'eq',
        value1: propertyDescriptor('user.flags.isNew'),
        value2: valueLiteral(false),
      },
      {
        conditionType: 'eq',
        value1: propertyDescriptor('user.purchases.length'),
        value2: valueLiteral(0),
      },
    ],
  }),
  inactive_30_days: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('user.metrics.daysSinceLastActive'),
    value2: valueLiteral(30),
  }),
  low_activity: () => ({
    conditionType: 'lte',
    value1: propertyDescriptor('user.metrics.weeklySessions'),
    value2: valueLiteral(2),
  }),
  cancelled_subscription: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('user.subscription.status'),
    value2: valueLiteral('cancelled'),
  }),
  repeat_purchaser: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('user.purchases.length'),
    value2: valueLiteral(1),
  }),
  high_spender: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('user.metrics.totalSpend'),
    value2: valueLiteral(100),
  }),
  first_payment: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('user.flags.isFirstPayment'),
    value2: valueLiteral(true),
  }),
  lifetime_spend_milestone: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('user.metrics.milestoneSpendReached'),
    value2: valueLiteral(1),
  }),
  frequent_weekly_purchases: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('user.metrics.weeklyPurchaseCount'),
    value2: valueLiteral(3),
  }),
  repeat_product_view: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('behavior.recentProductViews'),
    value2: valueLiteral(2),
  }),
  abandoned_cart: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('behavior.cart.status'),
    value2: valueLiteral('abandoned'),
  }),
  category_view_intent: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('behavior.categoryIntent'),
    value2: valueLiteral(true),
  }),
  high_income_region: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('geo.segment'),
    value2: valueLiteral('high_income'),
  }),
  price_sensitive_region: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('geo.segment'),
    value2: valueLiteral('price_sensitive'),
  }),
  mbc_app_user: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('user.flags.isMbcAppUser'),
    value2: valueLiteral(true),
  }),
  monthly_to_yearly_upsell: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('user.subscription.plan'),
    value2: valueLiteral('monthly'),
  }),
  influencer_promo_purchase: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('user.lastPurchase.source'),
    value2: valueLiteral('influencer'),
  }),
  weekend_purchase: () => ({
    conditionType: 'eq',
    value1: propertyDescriptor('behavior.isWeekendPurchaseWindow'),
    value2: valueLiteral(true),
  }),
  high_activity_reward: () => ({
    conditionType: 'gte',
    value1: propertyDescriptor('user.metrics.dailyActiveMinutes'),
    value2: valueLiteral(180),
  }),
};

const buildConditionForScenario = (scenario: OfferScenario): Condition => {
  const factory = TRIGGER_CONDITIONS[scenario.trigger.code];
  if (!factory) {
    throw new OfferRuleTreeBuildError(`Unsupported trigger code: ${scenario.trigger.code}`);
  }
  return factory();
};

const buildOperationChain = (scenarios: readonly OfferScenario[]): OfferRuleSet => {
  if (scenarios.length === 0) {
    
    return {
      operationType: 'action',
      action: {
        actionType: 'showOffer',
        params: {},
      },
    };
  }

  const sortedScenarios = [...scenarios].sort((a, b) => b.priority - a.priority);
  const firstScenario = sortedScenarios[0];

  const actionOperation: OfferRuleSet = {
    operationType: 'action',
    action: {
      actionType: 'showOffer',
      params: {
        offerId: [...firstScenario.configuration.offerIds],
        scenario: firstScenario.slug,
      },
    },
  };

  return {
    operationType: 'condition',
    condition: buildConditionForScenario(firstScenario),
    nextOperation: actionOperation,

  };
};

export const buildOfferRuleTree = (input: BuildOfferRuleTreeInput): OfferRuleTree => {
  if (!input.appId.trim()) {
    throw new OfferRuleTreeBuildError('AppId is required to build OfferRuleTree.');
  }

  if (!input.version.trim()) {
    throw new OfferRuleTreeBuildError('Version is required to build OfferRuleTree.');
  }

  if (!input.scenarios.length) {
    throw new OfferRuleTreeBuildError('At least one scenario is required to build OfferRuleTree.');
  }

  const expandedScenarios: Array<{
    slug: string;
    title: string;
    categoryCode: string;
    triggerCode: OfferTriggerCode;
    priority: number;
    offerIds: readonly string[];
    items: Array<{ id: string; title: string; type: string; metadata: Record<string, string | number | boolean> }>;
  }> = [];

  for (const scenario of input.scenarios) {
    const configProps = scenario.configuration.toProps();

    if (configProps.conditions && configProps.conditions.length > 0) {
      for (const condition of configProps.conditions) {
        expandedScenarios.push({
          slug: `${scenario.slug}-${condition.triggerCode}`,
          title: `${scenario.title} (${condition.triggerCode})`,
          categoryCode: scenario.category.code,
          triggerCode: condition.triggerCode,
          priority: scenario.priority,
          offerIds: condition.offerIds,
          items: condition.items
            ? condition.items.map((item) => ({
                id: item.id,
                title: item.title,
                type: item.type,
                metadata: { ...item.metadata },
              }))
            : [],
        });
      }
    } else {
      
      expandedScenarios.push({
        slug: scenario.slug,
        title: scenario.title,
        categoryCode: scenario.category.code,
        triggerCode: scenario.trigger.code,
        priority: scenario.priority,
        offerIds: configProps.offerIds,
        items: configProps.items
          ? configProps.items.map((item) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              metadata: { ...item.metadata },
            }))
          : [],
      });
    }
  }

  const sortedExpandedScenarios = [...expandedScenarios].sort((a, b) => b.priority - a.priority);

  const tempScenariosForRuleSet = sortedExpandedScenarios.map((expanded) => {
    
    const originalScenario = input.scenarios.find((s) => 
      s.slug === expanded.slug || expanded.slug.startsWith(s.slug)
    );
    
    if (originalScenario) {
      
      return {
        ...originalScenario,
        slug: expanded.slug,
        trigger: { code: expanded.triggerCode } as any,
        configuration: {
          ...originalScenario.configuration,
          offerIds: expanded.offerIds,
        } as any,
      } as OfferScenario;
    }

    return {
      slug: expanded.slug,
      trigger: { code: expanded.triggerCode } as any,
      category: { code: expanded.categoryCode as any } as any,
      priority: expanded.priority,
      configuration: {
        offerIds: expanded.offerIds,
      } as any,
    } as OfferScenario;
  });
  
  const ruleSet = buildOperationChain(tempScenariosForRuleSet);

  if (!ruleSet) {
    throw new OfferRuleTreeBuildError('Failed to construct operation chain for OfferRuleTree.');
  }

  return {
    appId: input.appId,
    version: input.version,
    generatedAt: new Date().toISOString(),
    ruleSet,
    scenarios: sortedExpandedScenarios.map((expanded) => ({
      slug: expanded.slug,
      title: expanded.title,
      categoryCode: expanded.categoryCode as any,
      triggerCode: expanded.triggerCode,
      priority: expanded.priority,
      offerIds: [...expanded.offerIds],
      items: expanded.items.length > 0 ? expanded.items as readonly OfferItemProps[] : undefined,
    })),
  };
};

const createDefaultRuleSet = (offerIds: readonly string[]): OfferRuleSet => ({
  operationType: 'action',
  action: {
    actionType: 'showOffer',
    params: {
      offerId: [...offerIds],
    },
  },
});

export const buildScenariosFromCatalog = (
  overrides?: Record<string, CatalogScenarioOverride | undefined>
): OfferScenario[] => {
  const scenarios: OfferScenario[] = [];

  for (const definition of OFFER_SCENARIO_CATALOG) {
    const override = overrides?.[definition.slug];
    const offerIds =
      override?.configuration?.offerIds && override.configuration.offerIds.length
        ? override.configuration.offerIds
        : [definition.slug];

    const scenarioProps: OfferScenarioProps = {
      id: definition.slug,
      slug: definition.slug,
      title: definition.title,
      description: definition.description,
      categoryCode: definition.categoryCode,
      triggerCode: definition.triggerCode,
      priority: override?.priority ?? definition.defaultPriority,
      ruleSet: createDefaultRuleSet(offerIds),
      defaultActions: definition.defaultActions,
      defaultTags: definition.defaultTags,
      defaultItems: definition.defaultItems,
      tags: override?.tags ?? definition.defaultTags ?? [],
      configuration: override?.configuration ?? {
        offerIds,
        items: definition.defaultItems,
      },
    };

    const scenarioResult = OfferScenario.create(scenarioProps);
    if (scenarioResult.isFailure) {
      const error = scenarioResult.error;
      if (error instanceof OfferScenarioConfigurationError) {
        throw error;
      }
      throw new OfferScenarioValidationError(error!.message);
    }

    scenarios.push(scenarioResult.value!);
  }

  return scenarios;
};

export const buildOfferRuleTreeFromCatalog = (
  input: BuildRuleTreeFromCatalogInput
): OfferRuleTree => {
  const scenarios = buildScenariosFromCatalog(input.overrides);

  return buildOfferRuleTree({
    appId: input.appId,
    version: input.version,
    scenarios,
  });
};






