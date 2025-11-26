import { Product } from '../types';
import { ProductId } from '../value-objects/product-id.value-object';

/**
 * Product Payment Domain Service
 * 
 * Encapsulates business logic for product payment operations
 * Pure domain logic without external dependencies
 */
export class ProductPaymentService {
  /**
   * Create product snapshot for payment
   */
  static createProductSnapshot(product: Product): ProductPaymentSnapshot {
    if (!product) {
      throw new Error('Product is required for payment');
    }

    // Extract price and currency from Value Objects
    const price = product.currentPrice?.amount || product.originalPrice?.amount || 0;
    const currency = product.currentPrice?.currency || product.originalPrice?.currency || 'USD';
    
    return {
      id: product.id.value, // Convert ProductId to string
      title: product.title || 'Unknown Product',
      price: price,
      currency: currency
    };
  }

  /**
   * Validate product for payment
   */
  static validateProductForPayment(product: Product): ValidationResult {
    const errors: string[] = [];

    if (!product) {
      errors.push('Product is required');
      return { isValid: false, errors };
    }

    if (!product.title || product.title.trim() === '') {
      errors.push('Product title is required');
    }

    if (!product.currentPrice && !product.originalPrice) {
      errors.push('Product must have a price');
    }

    if (product.isPurchased) {
      errors.push('Product has already been purchased');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get user context for payment
   */
  static createUserContext(
    currentUser: CurrentUser | null,
    appConfig: AppConfig
  ): UserPaymentContext {
    if (currentUser) {
      return {
        userId: currentUser.userId,
        appId: currentUser.appId,
        isAuthenticated: true
      };
    }
    
    // In the current business rules we do not support anonymous purchases.
    // If this method is called without an authenticated user, we still
    // return a context, but upstream use cases must block the flow earlier.
    return {
      userId: '',
      appId: appConfig.appId,
      isAuthenticated: false
    };
  }
}

/**
 * Product payment snapshot
 */
export interface ProductPaymentSnapshot {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly currency: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Current user data
 */
export interface CurrentUser {
  readonly userId: string;
  readonly username: string;
  readonly appId: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  readonly paymentServiceUrl: string;
  readonly appId: string;
}

/**
 * User payment context
 */
export interface UserPaymentContext {
  readonly userId: string;
  readonly appId: string;
  readonly isAuthenticated: boolean;
}
