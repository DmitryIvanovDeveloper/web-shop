import { IEvent } from '../../../../application/ports/event-bus.port';

/**
 * Event: Product Selected For Payment
 * Published by: Products Module
 * Consumed by: External Payment Service
 * 
 * Triggered when user clicks "Buy Now" button on a product
 */
export class ProductSelectedForPaymentEvent implements IEvent {
  public readonly type = 'ProductSelectedForPaymentEvent';

  constructor(
    public readonly productId: string,
    public readonly productSnapshot: {
      id: string;
      title: string;
      price: number;
      currency: string;
    }
  ) {}
}

