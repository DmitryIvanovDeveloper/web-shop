export type ComparableValue = string | number | boolean;

export interface ValueDescriptor {
  readonly type: 'value' | 'property';
  readonly value: ComparableValue;
}

export interface Condition {
  readonly conditionType: 'eq' | 'gte' | 'lte' | 'and' | 'or';
  readonly value1?: ValueDescriptor;
  readonly value2?: ValueDescriptor;
  readonly conditions?: readonly Condition[]; // For 'and'/'or'
}

export interface Action {
  readonly actionType: 'showOffer';
  readonly params: {
    readonly offerId: string | readonly string[];
    readonly scenario?: string;
  };
}

export interface Operation {
  readonly operationType: 'condition' | 'action';
  readonly condition?: Condition;
  readonly action?: Action;
  readonly nextOperation?: Operation;
  readonly elseOperation?: Operation; // For 'condition' type
}

export interface RuleSet extends Operation {}

export interface OfferRuleTreeScenario {
  readonly slug: string;
  readonly title: string;
  readonly categoryCode: string;
  readonly triggerCode: string;
  readonly priority: number;
  readonly offerIds: readonly string[];
}

export interface OfferRuleTree {
  readonly appId: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly ruleSet: RuleSet;
  readonly scenarios: readonly OfferRuleTreeScenario[];
}

export interface BuyButtonStyle {
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderRadius?: string;
  readonly padding?: string;
  readonly fontWeight?: string;
}

export interface BuyButton {
  readonly text?: string;
  readonly enabled?: boolean;
  readonly style?: BuyButtonStyle;
}

export interface Offer {
  readonly id: string;
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly backgroundImage?: string;
  readonly includedItems?: string[];
  readonly discount?: string;
  readonly playerLimit?: string;
  readonly timer?: string;
  readonly title?: string;
  readonly rarity?: string;
  readonly originalPrice?: string;
  readonly currentPrice?: string;
  readonly rpBonus?: number;
  readonly lpBonus?: number;
  readonly buyButton?: BuyButton;
}
