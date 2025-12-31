export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly occurredOn: Date;
  public readonly eventVersion: number = 1;

  constructor(eventType: string) {
    this.eventId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.eventType = eventType;
    this.occurredOn = new Date();
  }
}






