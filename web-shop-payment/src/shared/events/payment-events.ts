import { Event } from '../../application/ports/event-bus.port';
import { generateUUID } from '../utils/uuid';

/**
 * Event: Payment Confirmed
 * Published by: Payments Module (ConfirmPaymentUseCase)
 * Consumed by: Payments Module (PaymentWebhookHandler) - simulates webhook
 * 
 * Triggered after successful payment confirmation with payment provider
 */
export class PaymentConfirmedEvent implements Event {
  public readonly id: string;
  public readonly type = 'PaymentConfirmedEvent';
  public readonly timestamp: Date;
  public readonly source = 'payments';
  public readonly payload: {
    paymentIntentId: string;
    productSnapshot: {
      id: string;
      title: string;
      price: number;
      currency: string;
    };
    userId: string;
    appId?: string; // APP123 from query params
  };

  constructor(
    paymentIntentId: string,
    productSnapshot: {
      id: string;
      title: string;
      price: number;
      currency: string;
    },
    userId: string,
    appId?: string
  ) {
    this.id = generateUUID();
    this.timestamp = new Date();
    this.payload = {
      paymentIntentId,
      productSnapshot,
      userId,
      appId
    };
  }
}

