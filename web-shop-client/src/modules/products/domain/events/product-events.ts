import { IEvent } from '../../../../application/ports/event-bus.port';


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

