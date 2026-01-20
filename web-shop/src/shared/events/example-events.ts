import { Event } from '../../application/ports/event-bus.port';

export abstract class BaseEvent implements Event {
  public readonly id: string;
  public readonly type: string;
  public readonly timestamp: Date;
  public readonly source: string;
  public readonly payload: any;

  constructor(type: string, payload: any, source: string) {
    this.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.timestamp = new Date();
    this.source = source;
    this.payload = payload;
  }
}

export class UserCreatedEvent extends BaseEvent {
  constructor(userId: string, email: string, name: string) {
    super('UserCreated', { userId, email, name }, 'user-management');
  }
}

export class OrderCreatedEvent extends BaseEvent {
  constructor(orderId: string, userId: string, amount: number, currency: string) {
    super('OrderCreated', { orderId, userId, amount, currency }, 'order-management');
  }
}

export class DashboardDataUpdatedEvent extends BaseEvent {
  constructor(dashboardId: string, dataType: 'sales' | 'revenue' | 'geography' | 'conversion') {
    super('DashboardDataUpdated', { dashboardId, dataType, timestamp: new Date() }, 'realtime-dashboard');
  }
}

export abstract class EventHandler<T extends BaseEvent> {
  abstract handle(event: T): Promise<void>;
}

