import { injectable } from 'inversify';
import { BuyButtonStyle } from '../../domain/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Product Style Service
 * 
 * Infrastructure service for loading product styles from JSON
 * Handles button styles and other UI-related configurations
 */
@injectable()
export class ProductStyleService {
  constructor(
    // Note: Logger injection would be added here if needed
  ) {}

  /**
   * Load button style from products.json
   */
  async getButtonStyle(): Promise<BuyButtonStyle> {
    try {
      const response = await fetch('/mocks/api/products/products.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load product styles: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the button style from the JSON
      return data.buyButton?.style || this._getDefaultButtonStyle();
    } catch (error) {
      console.error('[ProductStyleService] Failed to load button style:', error);
      // Return default style on error
      return this._getDefaultButtonStyle();
    }
  }

  /**
   * Load badge styles from products.json
   */
  async getBadgeStyles(): Promise<Record<string, { bg: string; text: string; skew: string }>> {
    try {
      const response = await fetch('/mocks/api/products/products.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load product styles: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the badge styles from the JSON
      return data.badges || this._getDefaultBadgeStyles();
    } catch (error) {
      console.error('[ProductStyleService] Failed to load badge styles:', error);
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
