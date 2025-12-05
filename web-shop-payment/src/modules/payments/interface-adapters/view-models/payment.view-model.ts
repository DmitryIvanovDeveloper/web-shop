/**
 * Payment View Model
 * 
 * UI state management for payment operations
 * Contains all data needed for payment form rendering
 */

export interface PaymentViewModel {
  // Product Information
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
  } | null;

  // Payment Intent Information
  paymentIntent: {
    intentId: string;
    clientSecret: string;
    status: string;
  } | null;

  // Promo Code Information
  promoCode?: {
    code: string;
    discount: number;
    discountType: 'percent' | 'fixed_amount';
  } | null;
  originalPrice: number;
  finalPrice: number;

  // UI State
  status: 'idle' | 'loading' | 'processing' | 'success' | 'error';
  error: string | null;

  // Form State
  isFormValid: boolean;
  isProcessing: boolean;
  isValidatingPromoCode: boolean;
  promoCodeError: string | null;
}

/**
 * Payment View Model Factory
 */
export class PaymentViewModelFactory {
  public static create(): PaymentViewModel {
    return {
      product: null,
      paymentIntent: null,
      promoCode: null,
      originalPrice: 0,
      finalPrice: 0,
      status: 'idle',
      error: null,
      isFormValid: false,
      isProcessing: false,
      isValidatingPromoCode: false,
      promoCodeError: null
    };
  }

  public static withProduct(product: {
    id: string;
    title: string;
    price: number;
    currency: string;
  }): PaymentViewModel {
    return {
      product,
      paymentIntent: null,
      promoCode: null,
      originalPrice: product.price,
      finalPrice: product.price,
      status: 'idle',
      error: null,
      isFormValid: true,
      isProcessing: false,
      isValidatingPromoCode: false,
      promoCodeError: null
    };
  }
}
