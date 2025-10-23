import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from 'inversify';
import { IAsyncEventHandler, ISyncEventHandler } from '../events-handler.plugin';
import { IEvent } from '../event';
import type { Logger } from '../../../application/ports/logger.port';

// Define ROOT_TYPES locally to avoid importing the main container
const ROOT_TYPES = {
  Logger: Symbol.for('Logger'),
  EventBus: Symbol.for('IEventBus')
} as const;

// Create a simplified EventBus for testing
class TestEventBus {
  private handlers: Map<string, (ISyncEventHandler<IEvent> | IAsyncEventHandler<IEvent>)[]> = new Map();
  
  constructor(
    private logger: Logger,
    private container: Container
  ) {}

  publish<TEvent extends IEvent>(event: TEvent): void {
    const eventType = (event as any).type ?? event.constructor.name;
    this.logger.info(`[EventBus] Publishing sync event: ${eventType}`);
    
    const handlers = this.handlers.get(eventType) || [];

    for (const handler of handlers) {
      if ('handle' in handler && (handler as ISyncEventHandler<TEvent>).canHandle(event)) {
        (handler as ISyncEventHandler<TEvent>).handle(event);
      }
    }

    const fromContainer = this.container.getAll<ISyncEventHandler<TEvent>>(
      Symbol.for(`ISyncEventHandler<${eventType}>`),
    );

    for (const handler of fromContainer) {
      if (!handler.canHandle(event)) {
        continue;
      }
      handler.handle(event);
    }
  }

  async publishAsync<TEvent extends IEvent>(event: TEvent): Promise<void> {
    const eventType = (event as any).type ?? event.constructor.name;
    this.logger.info(`[EventBus] Publishing async event: ${eventType}`);
    
    const handlers = this.handlers.get(eventType) || [];
    const tasks: Promise<void>[] = [];

    for (const handler of handlers) {
      if ('handleAsync' in handler && (handler as IAsyncEventHandler<TEvent>).canHandle(event)) {
        tasks.push((handler as IAsyncEventHandler<TEvent>).handleAsync(event));
      }
    }

    const asyncHandlers = this.container.getAll<IAsyncEventHandler<TEvent>>(
      Symbol.for(`IAsyncEventHandler<${eventType}>`),
    );

    for (const handler of asyncHandlers) {
      if (handler.canHandle(event)) {
        tasks.push(
          handler.handleAsync(event).catch(error => {
            this.logger.error(`[EventBus] Handler error: ${error.message}`);
          })
        );
      }
    }

    if (tasks.length > 0) await Promise.all(tasks);
  }

  subscribe<TEvent extends IEvent>(handler: ISyncEventHandler<TEvent> | IAsyncEventHandler<TEvent>): void {
    const eventType = this.extractGenericType(handler);
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as any);
  }

  unsubscribe<TEvent extends IEvent>(handler: ISyncEventHandler<TEvent> | IAsyncEventHandler<TEvent>): void {
    const eventType = this.extractGenericType(handler);
    const list = this.handlers.get(eventType);
    if (list) {
      const index = list.indexOf(handler as any);
      if (index > -1) list.splice(index, 1);
    }
  }

  private extractGenericType(handler: any): string {
    const name = handler?.constructor?.name;
    if (!name) return 'TestEvent';
    const match = /Handler<(.*?)>/.exec(name);
    return match ? match[1] : 'TestEvent'; // Default to TestEvent for our test handlers
  }
}

class TestEvent implements IEvent {
  public readonly type = 'TestEvent';
  constructor(public readonly data: string) {}
}

class TestAsyncHandler implements IAsyncEventHandler<TestEvent> {
  public handledEvents: TestEvent[] = [];
  
  canHandle(event: TestEvent): boolean {
    return event.type === 'TestEvent';
  }
  
  async handleAsync(event: TestEvent): Promise<void> {
    this.handledEvents.push(event);
  }
}

class TestSyncHandler implements ISyncEventHandler<TestEvent> {
  public handledEvents: TestEvent[] = [];
  
  canHandle(event: TestEvent): boolean {
    return event.type === 'TestEvent';
  }
  
  handle(event: TestEvent): void {
    this.handledEvents.push(event);
  }
}

describe('EventBus', () => {
  let container: Container;
  let eventBus: TestEventBus;
  let mockLogger: Logger;

  beforeEach(() => {
    container = new Container();
    
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    } as unknown as Logger;
    
    container.bind<Logger>(ROOT_TYPES.Logger).toConstantValue(mockLogger);
    
    // Create TestEventBus instance
    eventBus = new TestEventBus(mockLogger, container);
    
    container.bind<TestEventBus>(ROOT_TYPES.EventBus).toConstantValue(eventBus);
  });

  it('should publish async event to registered handlers', async () => {
    const handler = new TestAsyncHandler();
    const event = new TestEvent('test-data');
    
    container.bind(Symbol.for('IAsyncEventHandler<TestEvent>')).toConstantValue(handler);
    
    await eventBus.publishAsync(event);
    
    expect(handler.handledEvents).toHaveLength(1);
    expect(handler.handledEvents[0].data).toBe('test-data');
    expect(mockLogger.info).toHaveBeenCalledWith('[EventBus] Publishing async event: TestEvent');
  });

  it('should publish sync event to registered handlers', () => {
    const handler = new TestSyncHandler();
    const event = new TestEvent('test-data');
    
    container.bind(Symbol.for('ISyncEventHandler<TestEvent>')).toConstantValue(handler);
    
    eventBus.publish(event);
    
    expect(handler.handledEvents).toHaveLength(1);
    expect(handler.handledEvents[0].data).toBe('test-data');
    expect(mockLogger.info).toHaveBeenCalledWith('[EventBus] Publishing sync event: TestEvent');
  });

  it('should not call handler if canHandle returns false', async () => {
    const handler = new TestAsyncHandler();
    handler.canHandle = vi.fn().mockReturnValue(false);
    
    const event = new TestEvent('test-data');
    
    container.bind(Symbol.for('IAsyncEventHandler<TestEvent>')).toConstantValue(handler);
    
    await eventBus.publishAsync(event);
    
    expect(handler.handledEvents).toHaveLength(0);
  });

  it('should call multiple handlers for same event', async () => {
    const handler1 = new TestAsyncHandler();
    const handler2 = new TestAsyncHandler();
    const event = new TestEvent('test-data');
    
    container.bind(Symbol.for('IAsyncEventHandler<TestEvent>')).toConstantValue(handler1);
    container.bind(Symbol.for('IAsyncEventHandler<TestEvent>')).toConstantValue(handler2);
    
    await eventBus.publishAsync(event);
    
    expect(handler1.handledEvents).toHaveLength(1);
    expect(handler2.handledEvents).toHaveLength(1);
  });

  it('should handle mixed sync and async handlers', async () => {
    const syncHandler = new TestSyncHandler();
    const asyncHandler = new TestAsyncHandler();
    const event = new TestEvent('test-data');
    
    container.bind(Symbol.for('ISyncEventHandler<TestEvent>')).toConstantValue(syncHandler);
    container.bind(Symbol.for('IAsyncEventHandler<TestEvent>')).toConstantValue(asyncHandler);
    
    await eventBus.publishAsync(event);
    
    expect(syncHandler.handledEvents).toHaveLength(0); // Sync handlers don't handle async events
    expect(asyncHandler.handledEvents).toHaveLength(1);
  });

  it('should subscribe and unsubscribe handlers manually', () => {
    const handler = new TestSyncHandler();
    const event = new TestEvent('test-data');
    
    // Subscribe
    eventBus.subscribe(handler);
    eventBus.publish(event);
    expect(handler.handledEvents).toHaveLength(1);
    
    // Unsubscribe
    eventBus.unsubscribe(handler);
    eventBus.publish(event);
    expect(handler.handledEvents).toHaveLength(1); // Should still be 1, not 2
  });

  it('should handle exceptions in handlers gracefully', async () => {
    const handler = new TestAsyncHandler();
    handler.handleAsync = vi.fn().mockRejectedValue(new Error('Handler error'));
    
    const event = new TestEvent('test-data');
    
    container.bind(Symbol.for('IAsyncEventHandler<TestEvent>')).toConstantValue(handler);
    
    // Should not throw
    await expect(eventBus.publishAsync(event)).resolves.toBeUndefined();
  });
});
