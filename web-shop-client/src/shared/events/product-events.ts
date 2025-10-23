import { Event } from '../../application/ports/event-bus.port';

/**
 * Event: Product Selected For Payment
 * Published by: Products Module
 * Consumed by: External Payment Service
 * 
 * Triggered when user clicks "Buy Now" button on a product
 */
export class ProductSelectedForPaymentEvent implements Event {
  public readonly id: string;
  public readonly type = 'ProductSelectedForPaymentEvent';
  public readonly timestamp: Date;
  public readonly source = 'products';
  public readonly payload: {
    productId: string;
    productSnapshot: {
      id: string;
      title: string;
      price: number;
      currency: string;
    };
  };

  constructor(
    productId: string,
    productSnapshot: {
      id: string;
      title: string;
      price: number;
      currency: string;
    }
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date();
    this.payload = {
      productId,
      productSnapshot
    };
  }
}

