'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentForm } from './components/payment-form';
import { PaymentPresenter } from '../presenters/payment.presenter';
import { container } from '../../../../infrastructure/bootstrap/container';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { PaymentViewModel } from '../view-models/payment.view-model';

/**
 * Payment Page UI Component
 * 
 * Clean Architecture Interface Adapter for payment page
 * Handles payment initialization and user interactions
 */
export function PaymentPage(): JSX.Element {
  const [, forceUpdate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get PaymentPresenter from DI container (singleton)
  const paymentPresenter = container.get<PaymentPresenter>(PAYMENT_TYPES.PaymentPresenter);
  
  // Debug: Check if we're getting the same instance
  console.log('[PaymentPage] PaymentPresenter instance:', {
    instanceId: paymentPresenter.constructor.name,
    hasViewModel: !!paymentPresenter.viewModel,
    viewModelStatus: paymentPresenter.viewModel.status
  });

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized) {
      return;
    }

    const productId = searchParams.get('productId');
    
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Load product data and create payment intent
    const initializePayment = async () => {
      try {
        console.log('[PaymentPage] Initializing payment for product:', productId);
        
        // Get product data from URL params
        const productData = {
          id: productId,
          title: searchParams.get('title') || 'Product',
          price: parseFloat(searchParams.get('price') || '0'),
          currency: searchParams.get('currency') || 'USD',
          appId: searchParams.get('appId') || undefined, // APP123 from query params
          userId: searchParams.get('userId') || undefined // user-003 from query params
        };

        console.log('[PaymentPage] Product data:', productData);

        // Initialize payment presenter with product data
        await paymentPresenter.onProductSelectedForPayment(productData);
        
        console.log('[PaymentPage] Payment initialized:', {
          hasProduct: !!paymentPresenter.viewModel.product,
          hasPaymentIntent: !!paymentPresenter.viewModel.paymentIntent,
          status: paymentPresenter.viewModel.status,
          productId: paymentPresenter.viewModel.product?.id,
          intentId: paymentPresenter.viewModel.paymentIntent?.intentId,
          fullViewModel: paymentPresenter.viewModel
        });

        // Double-check PaymentPresenter state
        console.log('[PaymentPage] PaymentPresenter state after initialization:', {
          presenterStatus: paymentPresenter.viewModel.status,
          presenterHasProduct: !!paymentPresenter.viewModel.product,
          presenterHasPaymentIntent: !!paymentPresenter.viewModel.paymentIntent,
          presenterProductId: paymentPresenter.viewModel.product?.id,
          presenterIntentId: paymentPresenter.viewModel.paymentIntent?.intentId
        });

        // Subscribe to PaymentPresenter changes
        const unsubscribe = paymentPresenter.onViewModelChange(() => {
          console.log('[PaymentPage] ViewModel changed, forcing re-render');
          forceUpdate({});
        });
        
        setLoading(false);
        setInitialized(true);
      } catch (err) {
        console.error('[PaymentPage] Failed to initialize payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        setLoading(false);
        setInitialized(true);
      }
    };

    initializePayment();
  }, []); // Empty dependency array - run only once on mount


  const handleConfirmPayment = async (paymentContext: any) => {
    // Always use PaymentPresenter's viewModel as source of truth
    const currentViewModel = paymentPresenter.viewModel;
    
    console.log('[PaymentPage] handleConfirmPayment called', {
      presenterViewModel: currentViewModel,
      presenterStatus: currentViewModel.status,
      presenterHasProduct: !!currentViewModel.product,
      presenterHasPaymentIntent: !!currentViewModel.paymentIntent,
      presenterInstanceId: paymentPresenter.constructor.name
    });
    
    if (!currentViewModel.product || !currentViewModel.paymentIntent) {
      console.error('[PaymentPage] Payment not properly initialized in PaymentPresenter', {
        hasProduct: !!currentViewModel.product,
        hasPaymentIntent: !!currentViewModel.paymentIntent,
        status: currentViewModel.status,
        error: currentViewModel.error,
        fullViewModel: currentViewModel
      });
      return;
    }
    
    try {
      await paymentPresenter.onConfirmPayment(paymentContext);
      
      // Check if payment was successful
      const updatedViewModel = paymentPresenter.viewModel;
      console.log('[PaymentPage] Payment confirmation result:', {
        status: updatedViewModel.status,
        hasError: !!updatedViewModel.error
      });
      
      if (updatedViewModel.status === 'success') {
        // Payment successful - redirect to success page
        console.log('[PaymentPage] Payment successful, redirecting to success page');
        // The redirect is handled in PaymentPresenter
      }
    } catch (error) {
      console.error('[PaymentPage] Payment confirmation failed:', error);
    }
  };

  const handleRetryPayment = async () => {
    console.log('[PaymentPage] Retrying payment - creating new payment intent');
    
    try {
      // Reset and create new payment intent
          const productData = {
            id: searchParams.get('productId') || '',
            title: searchParams.get('title') || 'Product',
            price: parseFloat(searchParams.get('price') || '0'),
            currency: searchParams.get('currency') || 'USD',
            appId: searchParams.get('appId') || undefined,
            userId: searchParams.get('userId') || undefined
          };

      await paymentPresenter.onProductSelectedForPayment(productData);
      
      console.log('[PaymentPage] New payment intent created:', {
        hasProduct: !!paymentPresenter.viewModel.product,
        hasPaymentIntent: !!paymentPresenter.viewModel.paymentIntent,
        status: paymentPresenter.viewModel.status,
        intentId: paymentPresenter.viewModel.paymentIntent?.intentId
      });
    } catch (error) {
      console.error('[PaymentPage] Failed to retry payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading Payment</h1>
            <p className="text-gray-600">Preparing your secure payment experience...</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Payment</h2>
              <p className="text-gray-600">Please wait while we prepare your secure payment form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600">Something went wrong with your payment</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error: {error}</h2>
              <p className="text-gray-600 mb-6">We encountered an issue while setting up your payment.</p>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current viewModel from presenter
  const paymentViewModel = paymentPresenter.viewModel;

  if (!paymentViewModel.product || !paymentViewModel.paymentIntent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">No Payment Data</h1>
            <p className="text-gray-600">Payment information is not available</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payment Data Available</h2>
              <p className="text-gray-600 mb-6">We couldn't find the payment information for this transaction.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Payment Form - Full Screen */}
      <PaymentForm 
        viewModel={paymentViewModel}
        onConfirmPayment={handleConfirmPayment}
        onPromoCodeEntered={async (code: string) => {
          await paymentPresenter.onPromoCodeEntered(code);
        }}
        onPromoCodeRemoved={async () => {
          await paymentPresenter.onPromoCodeRemoved();
        }}
      />

      {/* Retry Button - Floating */}
      {paymentViewModel.status === 'error' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleRetryPayment}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry Payment</span>
          </button>
        </div>
      )}
    </>
  );
}
