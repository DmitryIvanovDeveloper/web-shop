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

  // UI State
  status: 'idle' | 'loading' | 'processing' | 'success' | 'error';
  error: string | null;

  // Form State
  isFormValid: boolean;
  isProcessing: boolean;
}

/**
 * Payment View Model Factory
 */
export class PaymentViewModelFactory {
  public static create(): PaymentViewModel {
    return {
      product: null,
      paymentIntent: null,
      status: 'idle',
      error: null,
      isFormValid: false,
      isProcessing: false
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
      status: 'idle',
      error: null,
      isFormValid: true,
      isProcessing: false
    };
  }
}
