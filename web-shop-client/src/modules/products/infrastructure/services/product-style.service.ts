import { inject, injectable } from 'inversify';
import { BuyButtonStyle } from '../../domain/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { ComponentNodeData } from '../../../../shared/config/app-config.types';

/**
 * Product Style Service
 * 
 * Infrastructure service for loading product styles from JSON
 * Handles button styles and other UI-related configurations
 */
@injectable()
export class ProductStyleService {
  private _appConfigCardStyles: ComponentNodeData | null = null;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public applyAppConfigStyles(styles: ComponentNodeData | null): void {
    this._appConfigCardStyles = styles;
    this._logger.info('[ProductStyleService] App-config card styles updated', {
      hasStyles: Boolean(styles)
    });
  }

  /**
   * Load button style from products.json
   */
  async getButtonStyle(): Promise<BuyButtonStyle> {
    if (this._appConfigCardStyles?.styles?.buyButton) {
      const style = this._appConfigCardStyles.styles.buyButton as Record<string, string | undefined>;

      const mappedStyle: BuyButtonStyle = {
        backgroundColor: style.backgroundColor,
        textColor: style.color,
        borderRadius: style.borderRadius,
        padding: style.padding,
        fontWeight: style.fontWeight,
        fontSize: style.fontSize,
      };

      this._logger.debug('[ProductStyleService] Using buy button style from app-config');
      return mappedStyle;
    }

    try {
      const response = await fetch('/mocks/api/products/products.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load product styles: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the button style from the JSON
      return data.buyButton?.style || this._getDefaultButtonStyle();
    } catch (error) {
      this._logger.error('[ProductStyleService] Failed to load button style from JSON, using default', error);
      // Return default style on error
      return this._getDefaultButtonStyle();
    }
  }

  /**
   * Load badge styles from products.json
   */
  async getBadgeStyles(): Promise<Record<string, { bg: string; text: string; skew: string }>> {
    const styles = this._appConfigCardStyles?.styles as Record<string, Record<string, string | undefined>> | undefined;

    if (styles) {
      const result: Record<string, { bg: string; text: string; skew: string }> = {};

      if (styles.discountBadge) {
        result.discount = {
          bg: styles.discountBadge.backgroundColor ?? '#FF4500',
          text: styles.discountBadge.color ?? '#FFFFFF',
          skew: styles.discountBadge.backgroundColor ?? '#FF4500'
        };
      }

      if (styles.rarity) {
        result.rarity = {
          bg: styles.rarity.backgroundColor ?? '#8A2BE2',
          text: styles.rarity.color ?? '#FFFFFF',
          skew: styles.rarity.backgroundColor ?? '#8A2BE2'
        };
      }

      if (styles.purchasedBadge) {
        result.purchased = {
          bg: styles.purchasedBadge.backgroundColor ?? '#10B981',
          text: styles.purchasedBadge.color ?? '#FFFFFF',
          skew: styles.purchasedBadge.backgroundColor ?? '#10B981'
        };
      }

      if (Object.keys(result).length > 0) {
        this._logger.debug('[ProductStyleService] Using badge styles from app-config', {
          keys: Object.keys(result)
        });
        return result;
      }
    }

    try {
      const response = await fetch('/mocks/api/products/products.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load product styles: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the badge styles from the JSON
      return data.badges || this._getDefaultBadgeStyles();
    } catch (error) {
      this._logger.error('[ProductStyleService] Failed to load badge styles from JSON, using default', error);
      // Return default styles on error
      return this._getDefaultBadgeStyles();
    }
  }

  /**
   * Get default button style as fallback
   */
  private _getDefaultButtonStyle(): BuyButtonStyle {
    return {
      backgroundColor: 'rgb(255, 215, 0)',
      textColor: '#000000',
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: 'bold'
    };
  }

  /**
   * Get default badge styles as fallback
   */
  private _getDefaultBadgeStyles(): Record<string, { bg: string; text: string; skew: string }> {
    return {
      discount: { 
        bg: '#FF4500', 
        text: 'text-white',
        skew: '#FF4500'
      },
      limit: { 
        bg: '#4169E1', 
        text: 'text-white',
        skew: '#4169E1'
      },
      timer: { 
        bg: '#FFD700', 
        text: 'text-black',
        skew: '#FFD700'
      },
      rarity: { 
        bg: '#8A2BE2', 
        text: 'text-white',
        skew: '#8A2BE2'
      },
      purchased: { 
        bg: '#10B981', 
        text: 'text-white',
        skew: '#10B981'
      }
    };
  }
}
