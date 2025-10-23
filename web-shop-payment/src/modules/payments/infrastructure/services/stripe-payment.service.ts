import { injectable } from 'inversify';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { PaymentServicePort, CreatePaymentIntentInput, PaymentIntentResult, ConfirmPaymentInput, PaymentStatusResult } from '../../application/ports/payment-service.port';
import { PaymentError, PaymentErrorCode, PaymentIntentCreationError, PaymentConfirmationError } from '../../domain/errors/payment.error';

/**
 * Stripe Payment Service Implementation
 * 
 * Infrastructure implementation of PaymentServicePort using Stripe
 * Handles payment processing operations through Stripe API
 */
@injectable()
export class StripePaymentService implements PaymentServicePort {
  public async createPaymentIntent(input: CreatePaymentIntentInput): Promise<Result<PaymentIntentResult, PaymentError>> {
    try {
      const response = await fetch(`${window.location.origin}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: input.amount,
          currency: input.currency,
          productId: input.productId,
          metadata: input.metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return Failure.fail(new PaymentIntentCreationError(
          new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`)
        ));
      }

      const data = await response.json();

      if (!data.paymentIntentId || !data.clientSecret) {
        return Failure.fail(new PaymentIntentCreationError(
          new Error('Invalid response from payment service')
        ));
      }

      return Success.ok({
        intentId: data.paymentIntentId,
        clientSecret: data.clientSecret,
        status: data.status || 'requires_payment_method'
      });
    } catch (error) {
      return Failure.fail(new PaymentIntentCreationError(
        error instanceof Error ? error : new Error('Unknown error creating payment intent')
      ));
    }
  }

  public async confirmPayment(input: ConfirmPaymentInput): Promise<Result<void, PaymentError>> {
    try {
      const stripe = input.paymentContext.providerInstance as Stripe;
      const elements = input.paymentContext.elementsInstance as StripeElements;

      if (!stripe || !elements) {
        return Failure.fail(new PaymentError(
          'Invalid payment context: missing Stripe or Elements instances',
          PaymentErrorCode.INVALID_PAYMENT_CONTEXT
        ));
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`
        },
        redirect: 'if_required'
      });

      if (error) {
        return Failure.fail(new PaymentConfirmationError(
          error.message || 'Payment confirmation failed',
          new Error(error.message || 'Payment confirmation failed')
        ));
      }

      return Success.ok(undefined);
    } catch (error) {
      return Failure.fail(new PaymentConfirmationError(
        'Unexpected payment confirmation error',
        error instanceof Error ? error : new Error('Unknown error')
      ));
    }
  }

  public async getPaymentStatus(paymentIntentId: string): Promise<Result<PaymentStatusResult, PaymentError>> {
    try {
      const response = await fetch(`${window.location.origin}/api/payments/status/${paymentIntentId}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return Failure.fail(new PaymentError(
          'Failed to get payment status',
          PaymentErrorCode.PAYMENT_PROVIDER_ERROR
        ));
      }

      const data = await response.json();

      return Success.ok({
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        lastPaymentError: data.lastPaymentError
      });
    } catch (error) {
      return Failure.fail(new PaymentError(
        'Unexpected error getting payment status',
        PaymentErrorCode.PAYMENT_PROVIDER_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }
}
