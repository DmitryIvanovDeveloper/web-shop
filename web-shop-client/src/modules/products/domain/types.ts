import { ProductId } from './value-objects/product-id.value-object';
import { Price } from './value-objects/price.value-object';

// Reuse Offer interface from offers module for consistency
export interface Product {
  readonly id: ProductId;
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly backgroundImage?: string;
  readonly includedItems?: string[];
  readonly discount?: string;
  readonly playerLimit?: string;
  readonly timer?: Date;
  readonly title?: string;
  readonly titleStyle?: TitleStyle;
  readonly rarity?: string;
  readonly originalPrice?: Price;
  readonly currentPrice?: Price;
  readonly rpBonus?: number;
  readonly lpBonus?: number;
  readonly appid?: string;
  readonly buyButton?: BuyButton;
  readonly isPurchased?: boolean;
}

export interface TitleStyle {
  readonly fontSize?: string;
  readonly fontWeight?: string;
  readonly color?: string;
}

export interface BuyButtonStyle {
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderRadius?: string;
  readonly padding?: string;
  readonly fontWeight?: string;
  readonly fontSize?: string;
}

export interface BuyButton {
  readonly text?: string;
  readonly enabled?: boolean;
  readonly style?: BuyButtonStyle;
  readonly redirectUrl?: string;
}

