import type { OfferScenarioCategoryCode } from '../value-objects/offer-scenario-category.value-object';
import type { OfferTriggerCode } from '../value-objects/offer-trigger.value-object';
import type { OfferRuleSet } from './offer-rule-set.type';
import type { OfferItemProps } from '../value-objects/offer-item.value-object';

export interface OfferRuleTreeScenarioMetadata {
  readonly slug: string;
  readonly title: string;
  readonly categoryCode: OfferScenarioCategoryCode;
  readonly triggerCode: OfferTriggerCode;
  readonly priority: number;
  readonly offerIds: readonly string[];
  readonly items?: readonly OfferItemProps[];
}

export interface OfferRuleTree {
  readonly appId: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly ruleSet: OfferRuleSet;
  readonly scenarios: readonly OfferRuleTreeScenarioMetadata[];
}

