import { injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { PaymentServicePort, CreatePaymentIntentInput, PaymentIntentResult, ConfirmPaymentInput, PaymentStatusResult } from '../../application/ports/payment-service.port';
import { PaymentError, PaymentErrorCode, PaymentIntentCreationError, PaymentConfirmationError } from '../../domain/errors/payment.error';

/**
 * Mock Payment Service Implementation
 * 
 * Development implementation that simulates payment processing
 * without requiring real Stripe API keys
 */
@injectable()
export class MockPaymentService implements PaymentServicePort {
  public async createPaymentIntent(input: CreatePaymentIntentInput): Promise<Result<PaymentIntentResult, PaymentError>> {
    console.log('[MockPaymentService] Creating mock payment intent', {
      amount: input.amount,
      currency: input.currency,
      productId: input.productId
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock payment intent
    const mockIntentId = `pi_mock_${Date.now()}`;
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

    console.log('[MockPaymentService] Mock payment intent created', {
      intentId: mockIntentId,
      clientSecret: mockClientSecret
    });

    return Success.ok({
      intentId: mockIntentId,
      clientSecret: mockClientSecret,
      status: 'requires_payment_method'
    });
  }

  public async confirmPayment(input: ConfirmPaymentInput): Promise<Result<void, PaymentError>> {
    console.log('[MockPaymentService] Confirming mock payment', {
      intentId: input.paymentIntentId
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful payment confirmation
    console.log('[MockPaymentService] Mock payment confirmed successfully');

    return Success.ok(undefined);
  }

  public async getPaymentStatus(paymentIntentId: string): Promise<Result<PaymentStatusResult, PaymentError>> {
    console.log('[MockPaymentService] Getting mock payment status', {
      paymentIntentId
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return mock status
    return Success.ok({
      status: 'succeeded',
      amount: 1749, // Mock amount in cents
      currency: 'usd',
      lastPaymentError: null
    });
  }
}

