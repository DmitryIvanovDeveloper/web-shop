'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentForm } from '../../src/modules/payments/interface-adapters/ui/components/payment-form';
import { PaymentPresenter } from '../../src/modules/payments/interface-adapters/presenters/payment.presenter';
import { container } from '../../src/infrastructure/bootstrap/container';
import { PAYMENT_TYPES } from '../../src/modules/payments/infrastructure/bootstrap/types';
import { PaymentViewModel } from '../../src/modules/payments/interface-adapters/view-models/payment.view-model';

export default function PaymentPage(): JSX.Element {
  const [paymentViewModel, setPaymentViewModel] = useState<PaymentViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get PaymentPresenter from DI container
  const paymentPresenter = container.get<PaymentPresenter>(PAYMENT_TYPES.PaymentPresenter);

  useEffect(() => {
    const productId = searchParams.get('productId');
    
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
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
          currency: searchParams.get('currency') || 'USD'
        };

        console.log('[PaymentPage] Product data:', productData);

        // Initialize payment presenter with product data
        await paymentPresenter.onProductSelectedForPayment(productData);
        
        // Get the updated view model
        const viewModel = paymentPresenter.viewModel;
        setPaymentViewModel(viewModel);
        
        console.log('[PaymentPage] Payment initialized:', {
          hasProduct: !!viewModel.product,
          hasPaymentIntent: !!viewModel.paymentIntent,
          status: viewModel.status
        });
        
        setLoading(false);
      } catch (err) {
        console.error('[PaymentPage] Failed to initialize payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        setLoading(false);
      }
    };

    initializePayment();
  }, [searchParams, paymentPresenter]);

  const handleBackToProducts = () => {
    // Redirect back to the main shop
    const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3001';
    window.location.href = clientUrl;
  };

  const handleConfirmPayment = async (paymentContext: any) => {
    if (!paymentViewModel) return;
    
    try {
      await paymentPresenter.onConfirmPayment(paymentContext);
      
      // Check if payment was successful
      const updatedViewModel = paymentPresenter.viewModel;
      if (updatedViewModel.status === 'success') {
        // Payment successful - redirect to success page
        router.push('/payment/success');
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading payment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button
            onClick={handleBackToProducts}
            className="text-white hover:text-gray-300 underline"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!paymentViewModel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No payment data available</div>
          <button
            onClick={handleBackToProducts}
            className="text-white hover:text-gray-300 underline"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <button
            onClick={handleBackToProducts}
            className="text-white hover:text-gray-300 underline"
          >
            ← Back to Products
          </button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-3xl font-bold mb-8">Complete Your Purchase</h1>
          
          {paymentViewModel.product && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-white text-xl font-semibold mb-2">{paymentViewModel.product.title}</h2>
              <p className="text-gray-300 text-lg">
                ${paymentViewModel.product.price} {paymentViewModel.product.currency}
              </p>
            </div>
          )}
          
          <PaymentForm 
            viewModel={paymentViewModel}
            onConfirmPayment={handleConfirmPayment}
          />
        </div>
      </div>
    </div>
  );
}
