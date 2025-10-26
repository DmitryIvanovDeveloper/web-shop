'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentViewModel } from '../../view-models/payment.view-model';
import { PaymentElementsContext } from '../../../application/ports/payment-service.port';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key');

interface PaymentFormProps {
  viewModel: PaymentViewModel;
  onConfirmPayment: (paymentContext: PaymentElementsContext) => Promise<void>;
}

/**
 * Payment Form Component
 * 
 * React component for payment form UI
 * Integrates with Stripe Elements for secure payment processing
 */
function PaymentFormContent({ viewModel, onConfirmPayment }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      return;
    }

    if (!viewModel.paymentIntent) {
      console.error('Payment intent not available');
      return;
    }

    try {
      await onConfirmPayment({
        providerInstance: stripe,
        elementsInstance: elements
      });
    } catch (error) {
      console.error('Payment confirmation failed:', error);
    }
  };

  if (!viewModel.product) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No product selected for payment</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-700 flex items-center justify-center md:p-8">
      {/* Main Card */}
      <div className="bg-gray-800 h-full w-full md:h-auto md:w-auto md:min-w-[500px] md:max-w-[600px] md:rounded-2xl shadow-2xl border-0 md:border border-gray-700 overflow-hidden !flex !flex-col md:max-h-[90vh]">

          {/* Product Summary Header */}
          <div className="bg-gray-900 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">You're purchasing</p>
                <h2 className="text-lg sm:text-xl font-bold text-white">{viewModel.product.title}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">${viewModel.product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Payment Element */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Payment Method</label>
                <div className="border border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-700">
                  <PaymentElement />
                </div>
              </div>

              {/* Error Message Only */}
              {viewModel.status === 'error' && viewModel.error && (
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-red-900/30 border border-red-600 rounded-lg">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-300 font-medium text-sm sm:text-base">Error: {viewModel.error}</span>
                </div>
              )}

              {/* Submit Button with inline status */}
              <button
                type="submit"
                disabled={!stripe || !elements || viewModel.isProcessing}
                className="w-full bg-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base"
              >
                <div className="flex items-center justify-center space-x-2">
                  {viewModel.status === 'success' ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Success! Redirecting...</span>
                    </>
                  ) : viewModel.isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Pay ${viewModel.product.price.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secured by Stripe</span>
            </div>
          </div>
      </div>
    </div>
  );
}

/**
 * Payment Form Wrapper with Stripe Elements
 */
export function PaymentForm({ viewModel, onConfirmPayment }: PaymentFormProps) {
  if (!viewModel.paymentIntent) {
    return (
      <div className="min-h-screen bg-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-blue-400"></div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret: viewModel.paymentIntent.clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#374151',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              backgroundColor: '#4b5563',
              border: '1px solid #6b7280',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#ffffff',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            },
            '.Input:focus': {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
            },
            '.Label': {
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              marginBottom: '8px',
            },
            '.Tab': {
              backgroundColor: '#4b5563',
              border: '1px solid #6b7280',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#ffffff',
            },
            '.Tab:hover': {
              backgroundColor: '#6b7280',
            },
            '.Tab--selected': {
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderColor: '#3b82f6',
            },
          }
        }
      }}
    >
      <PaymentFormContent viewModel={viewModel} onConfirmPayment={onConfirmPayment} />
    </Elements>
  );
}
