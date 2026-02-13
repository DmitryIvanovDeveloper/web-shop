import { Failure, Result, Success } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';
import type { OfferScenarioCategoryCode } from './offer-scenario-category.value-object';

export type OfferTriggerCode =
  | 'new_user_welcome'
  | 'returning_no_purchase'
  | 'inactive_30_days'
  | 'low_activity'
  | 'cancelled_subscription'
  | 'repeat_purchaser'
  | 'high_spender'
  | 'first_payment'
  | 'lifetime_spend_milestone'
  | 'frequent_weekly_purchases'
  | 'repeat_product_view'
  | 'abandoned_cart'
  | 'category_view_intent'
  | 'high_income_region'
  | 'price_sensitive_region'
  | 'mbc_app_user'
  | 'monthly_to_yearly_upsell'
  | 'influencer_promo_purchase'
  | 'weekend_purchase'
  | 'high_activity_reward';

export interface OfferTriggerProps {
  readonly code: OfferTriggerCode;
  readonly title: string;
  readonly description: string;
  readonly category: OfferScenarioCategoryCode;
  readonly recommendedAction: string;
}

const TRIGGER_DEFINITIONS: Record<OfferTriggerCode, OfferTriggerProps> = {
  new_user_welcome: {
    code: 'new_user_welcome',
    title: 'New user onboarding',
    description: 'Deliver a compelling welcome offer for first-time users.',
    category: 'welcome_retention',
    recommendedAction: 'Discounted starter pack or free trial period.',
  },
  returning_no_purchase: {
    code: 'returning_no_purchase',
    title: 'Returning without purchase',
    description: 'Encourage returning visitors who have not purchased yet.',
    category: 'welcome_retention',
    recommendedAction: 'Limited trial plan or base bundle incentive.',
  },
  inactive_30_days: {
    code: 'inactive_30_days',
    title: 'Re-engage inactive users',
    description: 'Win back users who have been inactive for over 30 days.',
    category: 'welcome_retention',
    recommendedAction: 'High-urgency win-back bundle with time-limited reward.',
  },
  low_activity: {
    code: 'low_activity',
    title: 'Low activity motivation',
    description: 'Boost engagement for users with low recent activity.',
    category: 'welcome_retention',
    recommendedAction: 'Progress boost, bonus currency or activity challenge.',
  },
  cancelled_subscription: {
    code: 'cancelled_subscription',
    title: 'Cancelled subscription recovery',
    description: 'Provide retention offer when a subscription is cancelled.',
    category: 'welcome_retention',
    recommendedAction: 'Personalised renewal discount or loyalty bundle.',
  },
  repeat_purchaser: {
    code: 'repeat_purchaser',
    title: 'Category affinity offer',
    description: 'Promote items in categories aligned with past purchases.',
    category: 'purchase_spending',
    recommendedAction: 'Cross-sell complementary items or category bundles.',
  },
  high_spender: {
    code: 'high_spender',
    title: 'High spender recognition',
    description: 'Reward customers who spent above a configured threshold.',
    category: 'purchase_spending',
    recommendedAction: 'VIP bundle with exclusive benefits or loyalty tier.',
  },
  first_payment: {
    code: 'first_payment',
    title: 'First payment upsell',
    description: 'Capitalize on first purchase momentum with add-ons.',
    category: 'purchase_spending',
    recommendedAction: 'Recommend higher tier or add-on pack immediately.',
  },
  lifetime_spend_milestone: {
    code: 'lifetime_spend_milestone',
    title: 'Lifetime spend milestone',
    description: 'Celebrate reaching a cumulative spend milestone.',
    category: 'purchase_spending',
    recommendedAction: 'Grant milestone bonus, badge or coupon.',
  },
  frequent_weekly_purchases: {
    code: 'frequent_weekly_purchases',
    title: 'Weekly purchase streak',
    description: 'Reward multiple purchases inside the same week.',
    category: 'purchase_spending',
    recommendedAction: 'Stacked loyalty rewards or escalating discount.',
  },
  repeat_product_view: {
    code: 'repeat_product_view',
    title: 'Repeat product view reminder',
    description: 'User viewed a product twice but did not convert.',
    category: 'cart_behavior',
    recommendedAction: 'Remind with incentive or social proof message.',
  },
  abandoned_cart: {
    code: 'abandoned_cart',
    title: 'Abandoned cart recovery',
    description: 'User left items in cart without completing checkout.',
    category: 'cart_behavior',
    recommendedAction: 'Offer cart completion bonus or time-limited discount.',
  },
  category_view_intent: {
    code: 'category_view_intent',
    title: 'Category interest',
    description: 'User browsed a category but no purchases yet.',
    category: 'cart_behavior',
    recommendedAction: 'Show curated offers for the viewed category.',
  },
  high_income_region: {
    code: 'high_income_region',
    title: 'High income geo targeting',
    description: 'Users from regions with high purchasing power.',
    category: 'geo_pricing',
    recommendedAction: 'Premium packages with exclusive bonuses.',
  },
  price_sensitive_region: {
    code: 'price_sensitive_region',
    title: 'Economy geo targeting',
    description: 'Users from price-sensitive regions.',
    category: 'geo_pricing',
    recommendedAction: 'Lean bundles with accessible price points.',
  },
  mbc_app_user: {
    code: 'mbc_app_user',
    title: 'MBC app acquisition',
    description: 'User originates from MBC application integration.',
    category: 'geo_pricing',
    recommendedAction: 'MBC-exclusive bundles and cross-app benefits.',
  },
  monthly_to_yearly_upsell: {
    code: 'monthly_to_yearly_upsell',
    title: 'Monthly to yearly upsell',
    description: 'Offer upgrade from monthly to yearly subscription.',
    category: 'promo_seasonal',
    recommendedAction: 'Discount on yearly plan with added perks.',
  },
  influencer_promo_purchase: {
    code: 'influencer_promo_purchase',
    title: 'Influencer promo journey',
    description: 'Customer used influencer promo code.',
    category: 'promo_seasonal',
    recommendedAction: 'Encourage referrals or gift bonus to share.',
  },
  weekend_purchase: {
    code: 'weekend_purchase',
    title: 'Weekend special',
    description: 'Purchase detected during weekend period.',
    category: 'promo_seasonal',
    recommendedAction: 'Unlock weekend-only cosmetic or discount.',
  },
  high_activity_reward: {
    code: 'high_activity_reward',
    title: 'High activity recognition',
    description: 'Celebrate consistently active customers.',
    category: 'promo_seasonal',
    recommendedAction: 'Exclusive cosmetic upgrades or prestige rewards.',
  },
};

export class OfferTrigger {
  private constructor(
    public readonly code: OfferTriggerCode,
    public readonly title: string,
    public readonly description: string,
    public readonly category: OfferScenarioCategoryCode,
    public readonly recommendedAction: string
  ) {}

  public static create(code: OfferTriggerCode): Result<OfferTrigger, InvalidArgumentError> {
    const definition = TRIGGER_DEFINITIONS[code];
    if (!definition) {
      return new Failure(new InvalidArgumentError(`Unsupported offer trigger: ${code}`));
    }
    return new Success(
      new OfferTrigger(
        definition.code,
        definition.title,
        definition.description,
        definition.category,
        definition.recommendedAction
      )
    );
  }

  public static getDefinition(code: OfferTriggerCode): OfferTriggerProps {
    const definition = TRIGGER_DEFINITIONS[code];
    if (!definition) {
      throw new InvalidArgumentError(`Unsupported offer trigger: ${code}`);
    }
    return definition;
  }

  public static all(): OfferTrigger[] {
    return (Object.keys(TRIGGER_DEFINITIONS) as OfferTriggerCode[]).map((code) => {
      const definition = TRIGGER_DEFINITIONS[code];
      return new OfferTrigger(
        definition.code,
        definition.title,
        definition.description,
        definition.category,
        definition.recommendedAction
      );
    });
  }
}





