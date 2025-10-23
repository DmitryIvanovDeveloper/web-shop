import { injectable, inject } from 'inversify';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { CreatePaymentIntentUseCase } from '../../application/use-cases/create-payment-intent.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
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
    private readonly _confirmPaymentUseCase: ConfirmPaymentUseCase
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
    this._viewModel.status = 'loading';

    try {
      // Create payment intent
      this._logger.info('[PaymentPresenter] Creating payment intent', {
        productId: productSnapshot.id,
        amount: productSnapshot.price,
        currency: productSnapshot.currency
      });

      const result = await this._createPaymentIntentUseCase.execute({
        productId: productSnapshot.id,
        amount: productSnapshot.price,
        currency: productSnapshot.currency
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
        this._logger.error('[PaymentPresenter] Payment confirmation failed', {
          error: result.error,
          intentId: this._viewModel.paymentIntent.intentId
        });
        return;
      }

      this._viewModel.status = 'success';
      this._viewModel.error = null;

      this._logger.info('[PaymentPresenter] Payment confirmed successfully', {
        intentId: this._viewModel.paymentIntent.intentId
      });

      // Redirect to Main Client after successful payment
      setTimeout(() => {
        this._logger.info('[PaymentPresenter] Redirecting to Main Client', {
          redirectUrl: 'http://localhost:3000'
        });
        window.location.href = 'http://localhost:3000';
      }, 2000); // 2 second delay to show success message
    } catch (error) {
      this._viewModel.status = 'error';
      this._viewModel.error = error instanceof Error ? error.message : 'Unknown error';
      this._logger.error('[PaymentPresenter] Unexpected error confirming payment', {
        error,
        intentId: this._viewModel.paymentIntent.intentId
      });
    } finally {
      this._viewModel.isProcessing = false;
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
