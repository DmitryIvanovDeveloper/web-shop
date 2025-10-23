import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import type { PaymentServicePort } from '../../application/ports/payment-service.port';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { PaymentConfirmedEvent } from '../../../../shared/events/payment-events';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { PaymentError, PaymentErrorCode } from '../../domain/errors/payment.error';

describe('ConfirmPaymentUseCase', () => {
  let useCase: ConfirmPaymentUseCase;
  let mockPaymentService: PaymentServicePort;
  let mockEventBus: EventBus;
  let mockLogger: Logger;

  beforeEach(() => {
    mockPaymentService = {
      createPaymentIntent: vi.fn(),
      confirmPayment: vi.fn(),
      getPaymentStatus: vi.fn()
    };

    mockEventBus = {
      publish: vi.fn(),
      publishAsync: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn()
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    useCase = new ConfirmPaymentUseCase(
      mockLogger,
      mockEventBus,
      mockPaymentService
    );
  });

  it('should confirm payment and publish PaymentConfirmedEvent', async () => {
    // Arrange
    const request = {
      paymentIntentId: 'pi_test_123',
      productSnapshot: {
        id: 'prod_123',
        title: 'Test Product',
        price: 29.99,
        currency: 'USD'
      },
      userId: 'user_123',
      paymentContext: {
        providerInstance: {},
        elementsInstance: {}
      }
    };

    vi.mocked(mockPaymentService.confirmPayment).mockResolvedValue(
      Success.ok(undefined)
    );

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    expect(mockPaymentService.confirmPayment).toHaveBeenCalledWith({
      paymentIntentId: request.paymentIntentId,
      paymentContext: request.paymentContext
    });
    expect(mockEventBus.publishAsync).toHaveBeenCalledWith(
      expect.any(PaymentConfirmedEvent)
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[ConfirmPaymentUseCase] Confirming payment',
      expect.objectContaining({
        paymentIntentId: request.paymentIntentId
      })
    );
  });

  it('should fail when payment confirmation fails', async () => {
    // Arrange
    const request = {
      paymentIntentId: 'pi_test_123',
      productSnapshot: {
        id: 'prod_123',
        title: 'Test Product',
        price: 29.99,
        currency: 'USD'
      },
      userId: 'user_123',
      paymentContext: {
        providerInstance: {},
        elementsInstance: {}
      }
    };

    const paymentError = new PaymentError('Payment failed', PaymentErrorCode.PAYMENT_CONFIRMATION_FAILED);
    vi.mocked(mockPaymentService.confirmPayment).mockResolvedValue(
      Failure.fail(paymentError)
    );

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.failure).toBe(true);
    expect((result as any).error).toBe(paymentError);
    expect(mockEventBus.publishAsync).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      '[ConfirmPaymentUseCase] Payment confirmation failed',
      expect.objectContaining({
        error: paymentError
      })
    );
  });

  it('should fail when payment context is invalid', async () => {
    // Arrange
    const request = {
      paymentIntentId: 'pi_test_123',
      productSnapshot: {
        id: 'prod_123',
        title: 'Test Product',
        price: 29.99,
        currency: 'USD'
      },
      userId: 'user_123',
      paymentContext: {
        providerInstance: null,
        elementsInstance: {}
      }
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.failure).toBe(true);
    expect((result as any).error.message).toBe('Invalid payment context provided');
    expect(mockPaymentService.confirmPayment).not.toHaveBeenCalled();
    expect(mockEventBus.publishAsync).not.toHaveBeenCalled();
  });
});
