import { Product } from '../types';
import { ProductId } from '../value-objects/product-id.value-object';


export class ProductPaymentService {
  
  static createProductSnapshot(product: Product): ProductPaymentSnapshot {
    if (!product) {
      throw new Error('Product is required for payment');
    }

        const price = product.price?.amount || 0;
    const currency = product.price?.currency || 'USD';
    
    return {
      id: product.id.value,       title: product.title || 'Unknown Product',
      price: price,
      currency: currency
    };
  }

  
  static validateProductForPayment(product: Product): ValidationResult {
    const errors: string[] = [];

    if (!product) {
      errors.push('Product is required');
      return { isValid: false, errors };
    }

    if (!product.title || product.title.trim() === '') {
      errors.push('Product title is required');
    }

    if (!product.price) {
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
    
                return {
      userId: '',
      appId: appConfig.appId,
      isAuthenticated: false
    };
  }
}


export interface ProductPaymentSnapshot {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly currency: string;
}


export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}


export interface CurrentUser {
  readonly userId: string;
  readonly username: string;
  readonly appId: string;
}


export interface AppConfig {
  readonly paymentServiceUrl: string;
  readonly appId: string;
}


export interface UserPaymentContext {
  readonly userId: string;
  readonly appId: string;
  readonly isAuthenticated: boolean;
}
