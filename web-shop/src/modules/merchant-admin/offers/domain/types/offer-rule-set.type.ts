export type ComparableValue = string | number | boolean | null;

export interface ValueDescriptor {
  readonly type: 'value' | 'property' | 'context';
  readonly value: ComparableValue | string;
}

export interface Condition {
  readonly conditionType: 'eq' | 'neq' | 'gte' | 'gt' | 'lte' | 'lt' | 'and' | 'or';
  readonly value1?: ValueDescriptor;
  readonly value2?: ValueDescriptor;
  readonly conditions?: readonly Condition[];
}

export interface ActionDescriptor {
  readonly actionType: 'showOffer' | 'applyBonus' | 'unlockContent' | 'sendNotification' | 'applyCoupon';
  readonly params?: Record<string, unknown>;
}

export interface Operation {
  readonly operationType: 'condition' | 'action';
  readonly condition?: Condition;
  readonly action?: ActionDescriptor;
  readonly nextOperation?: Operation;
  readonly elseOperation?: Operation;
}

export type OfferRuleSet = Operation;
