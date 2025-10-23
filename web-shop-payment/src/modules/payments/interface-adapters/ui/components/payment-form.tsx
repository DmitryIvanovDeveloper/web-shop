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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Complete Your Purchase</h2>
      
      {/* Product Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg">{viewModel.product.title}</h3>
        <p className="text-2xl font-bold text-green-600">
          ${viewModel.product.price.toFixed(2)} {viewModel.product.currency}
        </p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <PaymentElement />
        </div>

        {/* Status Messages */}
        {viewModel.status === 'loading' && (
          <div className="p-3 bg-blue-50 text-blue-700 rounded">
            Creating payment intent...
          </div>
        )}

        {viewModel.status === 'processing' && (
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded">
            Processing payment...
          </div>
        )}

        {viewModel.status === 'success' && (
          <div className="p-3 bg-green-50 text-green-700 rounded">
            Payment successful! Redirecting...
          </div>
        )}

        {viewModel.status === 'error' && viewModel.error && (
          <div className="p-3 bg-red-50 text-red-700 rounded">
            Error: {viewModel.error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || !elements || viewModel.isProcessing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {viewModel.isProcessing ? 'Processing...' : `Pay $${viewModel.product.price.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

/**
 * Payment Form Wrapper with Stripe Elements
 */
export function PaymentForm({ viewModel, onConfirmPayment }: PaymentFormProps) {
  if (!viewModel.paymentIntent) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret: viewModel.paymentIntent.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
          }
        }
      }}
    >
      <PaymentFormContent viewModel={viewModel} onConfirmPayment={onConfirmPayment} />
    </Elements>
  );
}
