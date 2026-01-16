import { injectable, inject } from 'inversify';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PROMO_CODE_TYPES } from '../../../promo-code/infrastructure/bootstrap/types';
import { CreatePaymentIntentUseCase } from '../../application/use-cases/create-payment-intent.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import { ValidatePromoCodeUseCase } from '../../../promo-code/application/use-cases/validate-promo-code.use-case';
import { PaymentViewModel, PaymentViewModelFactory } from '../view-models/payment.view-model';
import type { Logger } from '../../../../application/ports/logger.port';
import { PaymentElementsContext } from '../../application/ports/payment-service.port';
import { isFailure } from '../../../../shared/result/result';

/**
 * Payment Presenter
 * 
 * Coordinates payment UI logic and state management
 * Handles user interactions and delegates to use cases
 */
@injectable()
export class PaymentPresenter {
  private _viewModel: PaymentViewModel = PaymentViewModelFactory.create();
  private _onViewModelChange?: () => void;
  private _listeners: Set<() => void> = new Set();
  private _appId?: string; // Store appId from product selection
  private _userId?: string; // Store userId from product selection
    
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PAYMENT_TYPES.CreatePaymentIntentUseCase)
    private readonly _createPaymentIntentUseCase: CreatePaymentIntentUseCase,
    @inject(PAYMENT_TYPES.ConfirmPaymentUseCase)
    private readonly _confirmPaymentUseCase: ConfirmPaymentUseCase,
    @inject(PROMO_CODE_TYPES.ValidatePromoCodeUseCase)
    private readonly _validatePromoCodeUseCase: ValidatePromoCodeUseCase
  ) {}

  /**
   * Get current view model
   */
  public get viewModel(): PaymentViewModel {
    return this._viewModel;
  }

  /**
   * Subscribe to view model changes
   */
  public onViewModelChange(callback: () => void): () => void {
    this._logger.info('[PaymentPresenter] Adding view model change listener', {
      totalListeners: this._listeners.size
    });
    this._listeners.add(callback);
    this._onViewModelChange = callback; // Keep for backward compatibility
    
    // Return unsubscribe function
    return () => {
      this._listeners.delete(callback);
      this._logger.info('[PaymentPresenter] Removed view model change listener', {
        totalListeners: this._listeners.size
      });
    };
  }

  /**
   * Notify subscribers about view model changes
   */
  private notifyViewModelChange(): void {
    this._logger.info('[PaymentPresenter] Notifying view model change', {
      totalListeners: this._listeners.size,
      hasCallback: !!this._onViewModelChange,
      viewModel: {
        hasProduct: !!this._viewModel.product,
        hasPaymentIntent: !!this._viewModel.paymentIntent,
        status: this._viewModel.status
      }
    });
    
    // Notify all listeners
    this._listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        this._logger.error('[PaymentPresenter] Error in listener callback', { error });
      }
    });
    
    // Keep backward compatibility
    if (this._onViewModelChange) {
      this._onViewModelChange();
    }
  }

  /**
   * Handle product selected for payment (from Products Module via EventBus)
   */
  public async onProductSelectedForPayment(productSnapshot: {
    id: string;
    title: string;
    price: number;
    currency: string;
    appId?: string; // APP123 from query params
    userId?: string; // user-003 from query params
  }): Promise<void> {
    this._logger.info('[PaymentPresenter] Product selected for payment', {
      productId: productSnapshot.id,
      productTitle: productSnapshot.title,
      productPrice: productSnapshot.price
    });

    // Validate product data
    if (!productSnapshot.id || !productSnapshot.title || productSnapshot.price <= 0) {
      this._viewModel.status = 'error';
      this._viewModel.error = 'Invalid product data provided';
      this._logger.error('[PaymentPresenter] Invalid product data', productSnapshot);
      return;
    }

    // Store appId and userId for later use
    this._appId = productSnapshot.appId;
    this._userId = productSnapshot.userId;

    // Update view model with product information
    this._viewModel = PaymentViewModelFactory.withProduct(productSnapshot);
    // Ensure originalPrice and finalPrice are set correctly
    this._viewModel.originalPrice = productSnapshot.price;
    this._viewModel.finalPrice = productSnapshot.price;
    this._viewModel.status = 'loading';

    try {
      // Use finalPrice (with promo code discount if applied)
      const amountToCharge = this._viewModel.finalPrice || productSnapshot.price;

      // Create payment intent
      this._logger.info('[PaymentPresenter] Creating payment intent', {
        productId: productSnapshot.id,
        originalAmount: productSnapshot.price,
        finalAmount: amountToCharge,
        currency: productSnapshot.currency,
        hasPromoCode: !!this._viewModel.promoCode
      });

      const result = await this._createPaymentIntentUseCase.execute({
        productId: productSnapshot.id,
        amount: amountToCharge,
        currency: productSnapshot.currency,
        metadata: {
          userId: this._userId!,
          appId: this._appId!,
          productId: productSnapshot.id
        }
      });

      this._logger.info('[PaymentPresenter] Payment intent creation result', {
        isSuccess: !isFailure(result),
        hasData: !isFailure(result) ? !!result.data : false,
        hasError: isFailure(result) ? !!result.error : false
      });

      if (isFailure(result)) {
        this._viewModel.status = 'error';
        this._viewModel.error = result.error.message;
        this._logger.error('[PaymentPresenter] Failed to create payment intent', {
          error: result.error,
          productId: productSnapshot.id
        });
        this.notifyViewModelChange();
        return;
      }

      // Update view model with payment intent
      if (!isFailure(result)) {
        this._viewModel.paymentIntent = {
          intentId: result.data.intentId,
          clientSecret: result.data.clientSecret,
          status: result.data.status
        };
        this._viewModel.status = 'idle';
        this._viewModel.error = null;

        this._logger.info('[PaymentPresenter] Payment intent created successfully', {
          intentId: result.data.intentId,
          status: result.data.status
        });
      }

      // Notify subscribers about view model changes
      this.notifyViewModelChange();

      this._logger.info('[PaymentPresenter] ViewModel updated and notified', {
        hasProduct: !!this._viewModel.product,
        hasPaymentIntent: !!this._viewModel.paymentIntent,
        status: this._viewModel.status
      });

      // Dispatch custom event for UI components
      if (typeof window !== 'undefined' && !isFailure(result)) {
        window.dispatchEvent(new CustomEvent('paymentIntentCreated', {
          detail: { intentId: result.data.intentId, productId: productSnapshot.id }
        }));
        
        // Dispatch global state change event
        window.dispatchEvent(new CustomEvent('paymentViewModelChanged', {
          detail: this._viewModel
        }));
      }

      // Force additional notification after a short delay to ensure UI updates
      setTimeout(() => {
        this._logger.info('[PaymentPresenter] Sending delayed notification');
        this.notifyViewModelChange();
        
        // Also dispatch global event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('paymentViewModelChanged', {
            detail: this._viewModel
          }));
        }
      }, 100);

      if (!isFailure(result)) {
        this._logger.info('[PaymentPresenter] Payment intent created successfully', {
          intentId: result.data.intentId,
          productId: productSnapshot.id
        });
      }
    } catch (error) {
      this._viewModel.status = 'error';
      this._viewModel.error = error instanceof Error ? error.message : 'Unknown error';
          
      // Notify subscribers about view model changes
      this.notifyViewModelChange();
      
      this._logger.error('[PaymentPresenter] Unexpected error creating payment intent', {
        error,
        productId: productSnapshot.id,
        viewModelStatus: this._viewModel.status,
        viewModelError: this._viewModel.error
      });
    }
  }

  /**
   * Handle payment confirmation
   */
  public async onConfirmPayment(paymentContext: PaymentElementsContext): Promise<void> {
    this._logger.info('[PaymentPresenter] onConfirmPayment called', {
      viewModelStatus: this._viewModel.status,
      hasProduct: !!this._viewModel.product,
      hasPaymentIntent: !!this._viewModel.paymentIntent,
      productId: this._viewModel.product?.id,
      intentId: this._viewModel.paymentIntent?.intentId,
      fullViewModel: this._viewModel
    });

    if (!this._viewModel.product || !this._viewModel.paymentIntent) {
      this._logger.error('[PaymentPresenter] Cannot confirm payment: missing product or payment intent', {
        hasProduct: !!this._viewModel.product,
        hasPaymentIntent: !!this._viewModel.paymentIntent,
        productId: this._viewModel.product?.id,
        intentId: this._viewModel.paymentIntent?.intentId,
        viewModel: this._viewModel
      });
      
      this._viewModel.status = 'error';
      this._viewModel.error = 'Payment not properly initialized. Please refresh the page.';
      this.notifyViewModelChange();
      return;
    }

    this._logger.info('[PaymentPresenter] Confirming payment', {
      intentId: this._viewModel.paymentIntent.intentId,
      productId: this._viewModel.product.id
    });

    this._viewModel.status = 'processing';
    this._viewModel.isProcessing = true;
    this.notifyViewModelChange(); // Notify UI about processing state

    try {
      const result = await this._confirmPaymentUseCase.execute({
        paymentIntentId: this._viewModel.paymentIntent.intentId,
        productSnapshot: this._viewModel.product,
        userId: this._userId || 'current-user-id', // Use real userId from URL params
        appId: this._appId, // APP123 from query params
        paymentContext
      });

      if (isFailure(result)) {
        this._viewModel.status = 'error';
        this._viewModel.error = result.error.message;
        this._viewModel.isProcessing = false;
        this.notifyViewModelChange(); // Notify UI about error state
        this._logger.error('[PaymentPresenter] Payment confirmation failed', {
          error: result.error,
          intentId: this._viewModel.paymentIntent.intentId
        });
        return;
      }

      this._viewModel.status = 'success';
      this._viewModel.error = null;
      this._viewModel.isProcessing = false;
      this.notifyViewModelChange(); // Notify UI about success state

      this._logger.info('[PaymentPresenter] Payment confirmed successfully', {
        intentId: this._viewModel.paymentIntent.intentId
      });

      // Redirect to Main Client after successful payment with userId and appId
      const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://web-shop-client-ashy.vercel.app';
      const redirectUrl = new URL(clientUrl);
      
      // Add userId and appId as query parameters
      if (this._userId) {
        redirectUrl.searchParams.set('userId', this._userId);
      }
      if (this._appId) {
        redirectUrl.searchParams.set('appId', this._appId);
      }
      
      setTimeout(() => {
        this._logger.info('[PaymentPresenter] Redirecting to Main Client', {
          redirectUrl: redirectUrl.toString(),
          userId: this._userId,
          appId: this._appId
        });
        window.location.href = redirectUrl.toString();
      }, 2000); // 2 second delay to show success message
    } catch (error) {
      this._viewModel.status = 'error';
      this._viewModel.error = error instanceof Error ? error.message : 'Unknown error';
      this._viewModel.isProcessing = false;
      this.notifyViewModelChange(); // Notify UI about error state
      this._logger.error('[PaymentPresenter] Unexpected error confirming payment', {
        error,
        intentId: this._viewModel.paymentIntent.intentId
      });
    }
  }

  /**
   * Handle promo code entered
   */
  public async onPromoCodeEntered(code: string): Promise<void> {
    this._logger.info('[PaymentPresenter] Promo code entered', { code });

    if (!this._viewModel.product) {
      this._logger.warn('[PaymentPresenter] Cannot apply promo code: no product selected');
      return;
    }

    if (!this._appId) {
      this._logger.warn('[PaymentPresenter] Cannot apply promo code: no appId');
      return;
    }

    // Set validating state
    this._viewModel.isValidatingPromoCode = true;
    this._viewModel.promoCodeError = null;
    this.notifyViewModelChange();

    try {
      const result = await this._validatePromoCodeUseCase.execute({
        code: code.trim(),
        appId: this._appId,
        userId: this._userId,
        orderAmount: this._viewModel.originalPrice || this._viewModel.product.price,
        currency: this._viewModel.product.currency
      });

      if (isFailure(result)) {
        this._viewModel.promoCodeError = result.error.message;
        this._viewModel.isValidatingPromoCode = false;
        this.notifyViewModelChange();
        return;
      }

      // Apply discount
      const appliedDiscount = result.data;
      this._viewModel.promoCode = {
        code: appliedDiscount.promoCode.code,
        discount: appliedDiscount.discountAmount,
        discountType: appliedDiscount.promoCode.discountType
      };
      this._viewModel.originalPrice = this._viewModel.product.price;
      this._viewModel.finalPrice = appliedDiscount.finalAmount;
      this._viewModel.isValidatingPromoCode = false;
      this._viewModel.promoCodeError = null;

      this._logger.info('[PaymentPresenter] Promo code applied successfully', {
        code,
        discountAmount: appliedDiscount.discountAmount,
        finalPrice: appliedDiscount.finalAmount
      });

      // Recreate payment intent with new amount
      if (this._viewModel.paymentIntent) {
        await this._recreatePaymentIntent();
      }

      this.notifyViewModelChange();
    } catch (error) {
      this._logger.error('[PaymentPresenter] Error validating promo code', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code
      });
      this._viewModel.promoCodeError = error instanceof Error ? error.message : 'Failed to validate promo code';
      this._viewModel.isValidatingPromoCode = false;
      this.notifyViewModelChange();
    }
  }

  /**
   * Handle promo code removed
   */
  public async onPromoCodeRemoved(): Promise<void> {
    this._logger.info('[PaymentPresenter] Promo code removed');

    if (!this._viewModel.product) {
      return;
    }

    // Reset promo code state
    this._viewModel.promoCode = null;
    this._viewModel.originalPrice = this._viewModel.product.price;
    this._viewModel.finalPrice = this._viewModel.product.price;
    this._viewModel.promoCodeError = null;

    // Recreate payment intent with original amount
    if (this._viewModel.paymentIntent) {
      await this._recreatePaymentIntent();
    }

    this.notifyViewModelChange();
  }

  /**
   * Recreate payment intent with current final price
   */
  private async _recreatePaymentIntent(): Promise<void> {
    if (!this._viewModel.product) {
      return;
    }

    this._logger.info('[PaymentPresenter] Recreating payment intent', {
      productId: this._viewModel.product.id,
      amount: this._viewModel.finalPrice
    });

    try {
      const result = await this._createPaymentIntentUseCase.execute({
        productId: this._viewModel.product.id,
        amount: this._viewModel.finalPrice,
        currency: this._viewModel.product.currency,
        metadata: {
          userId: this._userId!,
          appId: this._appId!,
          productId: this._viewModel.product.id
        }
      });

      if (isFailure(result)) {
        this._logger.error('[PaymentPresenter] Failed to recreate payment intent', {
          error: result.error
        });
        return;
      }

      this._viewModel.paymentIntent = {
        intentId: result.data.intentId,
        clientSecret: result.data.clientSecret,
        status: result.data.status
      };

      this._logger.info('[PaymentPresenter] Payment intent recreated successfully', {
        intentId: result.data.intentId
      });
    } catch (error) {
      this._logger.error('[PaymentPresenter] Error recreating payment intent', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reset payment state
   */
  public reset(): void {
    this._viewModel = PaymentViewModelFactory.create();
    this._logger.info('[PaymentPresenter] Payment state reset');
  }
}
