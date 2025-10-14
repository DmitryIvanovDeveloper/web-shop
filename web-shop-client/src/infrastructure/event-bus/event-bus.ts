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

  // Асинхронная публикация (для фоновых операций)
  async publish(event: Event): Promise<void> {
    this.logger.info(`EventBus: Publishing event ${event.type}`, { eventId: event.id });
    
    const handlers = this.handlers.get(event.type) || [];
    
    // Асинхронная обработка - не блокирует основной поток
    Promise.all(
      handlers.map(handler => 
        this.handleEventSafely(handler, event)
      )
    ).catch(error => {
      this.logger.error(`EventBus: Error in async event processing for ${event.type}`, error);
    });
  }

  // Синхронная публикация (для критических операций)
  async publishSync(event: Event): Promise<void> {
    this.logger.info(`EventBus: Publishing sync event ${event.type}`, { eventId: event.id });
    
    const handlers = this.handlers.get(event.type) || [];
    
    // Синхронная обработка - гарантия выполнения
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
      this.logger.debug(`EventBus: Successfully handled event ${event.type}`, { eventId: event.id });
    } catch (error) {
      this.logger.error(`EventBus: Error handling event ${event.type}`, { 
        eventId: event.id, 
        error: error instanceof Error ? error.message : String(error) 
      });
      // Не пробрасываем ошибку, чтобы не сломать другие обработчики
    }
  }

  subscribe(eventType: string, handler: (event: Event) => Promise<void>): void {
    this.logger.debug(`EventBus: Subscribing to event ${eventType}`);
    
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: (event: Event) => Promise<void>): void {
    this.logger.debug(`EventBus: Unsubscribing from event ${eventType}`);
    
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Метод для получения статистики (для отладки)
  getStats(): { eventTypes: string[], totalHandlers: number } {
    const eventTypes = Array.from(this.handlers.keys());
    const totalHandlers = Array.from(this.handlers.values())
      .reduce((sum, handlers) => sum + handlers.length, 0);
    
    return { eventTypes, totalHandlers };
  }
}
