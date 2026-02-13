import { Failure, Result, Success } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export type OfferScenarioCategoryCode =
  | 'welcome_retention'
  | 'purchase_spending'
  | 'cart_behavior'
  | 'geo_pricing'
  | 'promo_seasonal';

export interface OfferScenarioCategoryProps {
  readonly code: OfferScenarioCategoryCode;
  readonly title: string;
  readonly description: string;
}

const CATEGORY_DEFINITIONS: Record<OfferScenarioCategoryCode, { title: string; description: string }> = {
  welcome_retention: {
    title: 'Welcome & Retention Offers',
    description:
      'Improve first-time experience and return journeys with tailored welcome, win-back and retention offers.',
  },
  purchase_spending: {
    title: 'Purchase & Spending-Based Offers',
    description:
      'Reward spenders with contextual upsell offers that reflect their purchase history and total spend.',
  },
  cart_behavior: {
    title: 'Cart & Behavior Triggers',
    description:
      'React to intent signals such as repeated product views or abandoned carts to nudge toward conversion.',
  },
  geo_pricing: {
    title: 'Geo & Pricing Segmentation',
    description:
      'Adjust pricing packages and bundles depending on geo-specific purchasing power and acquisition source.',
  },
  promo_seasonal: {
    title: 'Promo, Seasonal & Affiliate Offers',
    description:
      'Coordinate promotional, seasonal and partnership campaigns with targeted incentives and exclusives.',
  },
};

export class OfferScenarioCategory {
  private constructor(
    public readonly code: OfferScenarioCategoryCode,
    public readonly title: string,
    public readonly description: string
  ) {}

  public static create(code: OfferScenarioCategoryCode): Result<OfferScenarioCategory, InvalidArgumentError> {
    const definition = CATEGORY_DEFINITIONS[code];
    if (!definition) {
      return new Failure(new InvalidArgumentError(`Unsupported offer scenario category: ${code}`));
    }
    return new Success(new OfferScenarioCategory(code, definition.title, definition.description));
  }

  public static all(): OfferScenarioCategory[] {
    return (Object.keys(CATEGORY_DEFINITIONS) as OfferScenarioCategoryCode[]).map(
      (code) => new OfferScenarioCategory(code, CATEGORY_DEFINITIONS[code].title, CATEGORY_DEFINITIONS[code].description)
    );
  }
}





