import { Event, EventBus } from '../../application/ports/event-bus.port';

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Array<(event: Event) => Promise<void>>> = new Map();

  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    await Promise.all(
      handlers.map(handler => 
        handler(event).catch(error => 
          console.error(`Error handling event ${event.type}:`, error)
        )
      )
    );
  }

  subscribe(eventType: string, handler: (event: Event) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: (event: Event) => Promise<void>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
