import { Event } from '../../application/ports/event-bus.port';

export abstract class DomainEvent implements Event {
  public readonly id: string;
  public readonly type: string;
  public readonly timestamp: Date;
  public readonly source: string;
  public readonly eventVersion: number = 1;

  constructor(eventType: string, source: string = 'domain') {
    this.id = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = eventType;
    this.timestamp = new Date();
    this.source = source;
  }

  // Legacy properties for backward compatibility
  public get eventId(): string {
    return this.id;
  }

  public get eventType(): string {
    return this.type;
  }

  public get occurredOn(): Date {
    return this.timestamp;
  }

  public get payload(): any {
    return this;
  }
}






