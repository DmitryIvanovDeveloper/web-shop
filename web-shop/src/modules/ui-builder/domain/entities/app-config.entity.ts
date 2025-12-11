/**
 * Offer Card Template Styles
 */
export interface OfferCardStyles {
  container?: {
    backgroundColor?: string;
    borderRadius?: string;
    shadow?: string;
    backgroundOpacity?: string;
    blurAmount?: string;
  };
  topLabel?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    borderRadius?: string;
  };
  image?: {
    backgroundColor?: string;
    aspectRatio?: string;
    height?: string;
  };
  discountBadge?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    borderRadius?: string;
  };
  includedItems?: {
    backgroundColor?: string;
    itemBackgroundColor?: string;
  };
  title?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  description?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    lineHeight?: string;
  };
  priceBlock?: {
    borderRadius?: string;
    padding?: string;
    minHeight?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  originalPrice?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  currentPrice?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  rarity?: {
    backgroundColor?: string;
    color?: string;
  };
  buyButton?: {
    backgroundColor?: string;
    color?: string;
    borderRadius?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    minHeight?: string;
    // preview flag (persisted)
    enabled?: boolean;
  };
  purchasedBadge?: {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    borderRadius?: string;
    minHeight?: string;
    // preview flag (persisted)
    enabled?: boolean;
  };
  bonuses?: {
    rpColor?: string;
    lpColor?: string;
    fontSize?: string;
  };
}

export interface OfferCardMedia {
  mainImage?: string;
  mainImageAlt?: string;
}

/**
 * Offer Card Template
 */
export interface OfferCardTemplate {
  id: string;
  name: string;
  styles: OfferCardStyles;
  media?: OfferCardMedia;
}

/**
 * Application Config structure
 */
export interface AppConfigStructure {
  theme?: unknown;
  shared?: unknown;
  offerCards?: OfferCardTemplate[];
  [key: string]: unknown;
}

export interface AppConfig {
  id?: string;
  appId: string;
  version: import('../value-objects/config-version.vo').ConfigVersion;
  isDraft?: boolean;
  isActive?: boolean;
  config: AppConfigStructure | unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppConfigFactory {
  public static create(input: {
    appId: string;
    merchantId?: string;
    config: unknown;
    version: import('../value-objects/config-version.vo').ConfigVersion;
    isActive: boolean;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AppConfig {
    return {
      appId: input.appId,
      config: input.config,
      version: input.version,
      isActive: input.isActive,
      isDraft: input.isDraft,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
  }
}

