import { inject, injectable } from 'inversify';
import { BuyButtonStyle } from '../../domain/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { OfferCardTemplate } from '../../../../shared/config/app-config.types';


@injectable()
export class ProductStyleService {
  private _offerCardTemplate: OfferCardTemplate | null = null;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public applyAppConfigStyles(template: OfferCardTemplate | null): void {
    this._offerCardTemplate = template;
    this._logger.info('[ProductStyleService] App-config card template updated', {
      hasTemplate: Boolean(template),
      cardId: template?.id,
      cardName: template?.name,
    });

    if (typeof window !== 'undefined') {
      if (template?.styles) {
        (window as any).__offerCardStyles = {
          styles: template.styles,
          media: template.media,
        };
        this._logger.debug('[ProductStyleService] window.__offerCardStyles updated from offer card template', {
          cardId: template.id,
        });
      } else {
        delete (window as any).__offerCardStyles;
        this._logger.debug('[ProductStyleService] Cleared window.__offerCardStyles (no template styles)');
      }

      window.dispatchEvent(new Event('appConfigLoaded'));
    }
  }

  
  async getButtonStyle(): Promise<BuyButtonStyle> {
    const buyButton = this._offerCardTemplate?.styles?.buyButton;
    if (buyButton) {
      this._logger.debug('[ProductStyleService] Using buy button style from offer card template', {
        cardId: this._offerCardTemplate?.id,
      });

      return {
        backgroundColor: buyButton.backgroundColor,
        textColor: buyButton.color,
        borderRadius: buyButton.borderRadius,
        padding: buyButton.padding,
        fontWeight: buyButton.fontWeight,
        fontSize: buyButton.fontSize,
      };
    }

    try {
      const response = await fetch('/mocks/api/products/products.json');

      if (!response.ok) {
        throw new Error(`Failed to load product styles: ${response.status}`);
      }

      const data = await response.json();

            return data.buyButton?.style || this._getDefaultButtonStyle();
    } catch (error) {
      this._logger.error('[ProductStyleService] Failed to load button style from JSON, using default', error);
            return this._getDefaultButtonStyle();
    }
  }

  
  async getBadgeStyles(): Promise<Record<string, { bg: string; text: string; skew: string }>> {
    const styles = this._offerCardTemplate?.styles;

    if (styles) {
      const result: Record<string, { bg: string; text: string; skew: string }> = {};

      if (styles.discountBadge) {
        result.discount = {
          bg: styles.discountBadge.backgroundColor ?? '#FF4500',
          text: styles.discountBadge.color ?? '#FFFFFF',
          skew: styles.discountBadge.backgroundColor ?? '#FF4500',
        };
      }

      if (styles.rarity) {
        result.rarity = {
          bg: styles.rarity.backgroundColor ?? '#8A2BE2',
          text: styles.rarity.color ?? '#FFFFFF',
          skew: styles.rarity.backgroundColor ?? '#8A2BE2',
        };
      }

      if (styles.purchasedBadge) {
        result.purchased = {
          bg: styles.purchasedBadge.backgroundColor ?? '#10B981',
          text: styles.purchasedBadge.color ?? '#FFFFFF',
          skew: styles.purchasedBadge.backgroundColor ?? '#10B981',
        };
      }

      if (Object.keys(result).length > 0) {
        this._logger.debug('[ProductStyleService] Using badge styles from offer card template', {
          cardId: this._offerCardTemplate?.id,
          keys: Object.keys(result),
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

            return data.badges || this._getDefaultBadgeStyles();
    } catch (error) {
      this._logger.error('[ProductStyleService] Failed to load badge styles from JSON, using default', error);
            return this._getDefaultBadgeStyles();
    }
  }

  
  private _getDefaultButtonStyle(): BuyButtonStyle {
    return {
      backgroundColor: 'rgb(255, 215, 0)',
      textColor: '#000000',
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: 'bold'
    };
  }

  
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
