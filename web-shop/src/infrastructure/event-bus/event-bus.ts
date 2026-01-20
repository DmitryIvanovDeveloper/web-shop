import { injectable, inject } from 'inversify';
import type { Event, EventBus } from '../../application/ports/event-bus.port';
import type { Logger } from '../../application/ports/logger.port';
import { TYPES } from '../bootstrap/types';

@injectable()
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Array<(event: Event) => Promise<void>>> = new Map();

  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    Promise.all(
      handlers.map(handler => 
        this.handleEventSafely(handler, event)
      )
    ).catch(() => {
    });
  }

  async publishSync(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    await Promise.all(
      handlers.map(handler => 
        this.handleEventSafely(handler, event)
      )
    );
  }

  private async handleEventSafely(
    handler: (event: Event) => Promise<void>, 
    event: Event
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
    }
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

  getStats(): { eventTypes: string[], totalHandlers: number } {
    const eventTypes = Array.from(this.handlers.keys());
    const totalHandlers = Array.from(this.handlers.values())
      .reduce((sum, handlers) => sum + handlers.length, 0);
    
    return { eventTypes, totalHandlers };
  }
}
