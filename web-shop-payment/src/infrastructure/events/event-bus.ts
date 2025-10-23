import { injectable, inject } from 'inversify';
import type { Container } from 'inversify';
import { IAsyncEventHandler, ISyncEventHandler } from './events-handler.plugin';
import { EventBus as EventBusPort, Event } from '../../application/ports/event-bus.port';
import { IEvent } from './event';
import { ROOT_TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';
import { container } from '../bootstrap/container';

@injectable()
export class EventBus implements EventBusPort {
    private handlers: Map<string, (ISyncEventHandler<IEvent> | IAsyncEventHandler<IEvent>)[]> = new Map();
    
    constructor(
        @inject(ROOT_TYPES.Logger) 
        private logger: Logger
    ) {}

    publish(event: Event): void {
        const eventType = event.type;
        this.logger.info(`[EventBus] Publishing sync event: ${eventType}`);
        
        const handlers = this.handlers.get(eventType) || [];

        for (const handler of handlers) {
            if ('handle' in handler && (handler as ISyncEventHandler<IEvent>).canHandle(event as IEvent)) {
                (handler as ISyncEventHandler<IEvent>).handle(event as IEvent);
            }
        }

        const fromContainer = container.getAll<ISyncEventHandler<IEvent>>(
            Symbol.for(`ISyncEventHandler<${eventType}>`),
        );

        for (const handler of fromContainer) {
            if (!handler.canHandle(event as IEvent)) {
                continue;
            }
            handler.handle(event as IEvent);
        }
    }

    async publishAsync(event: Event): Promise<void> {
        const eventType = event.type;
        this.logger.info(`[EventBus] Publishing async event: ${eventType}`);
        
        const handlers = this.handlers.get(eventType) || [];
        const tasks: Promise<void>[] = [];

        for (const handler of handlers) {
            if ('handleAsync' in handler && (handler as IAsyncEventHandler<IEvent>).canHandle(event as IEvent)) {
                tasks.push((handler as IAsyncEventHandler<IEvent>).handleAsync(event as IEvent));
            }
        }

        const asyncHandlers = container.getAll<IAsyncEventHandler<IEvent>>(
            Symbol.for(`IAsyncEventHandler<${eventType}>`),
        );

        for (const handler of asyncHandlers) {
            if (handler.canHandle(event as IEvent)) {
                tasks.push(handler.handleAsync(event as IEvent));
            }
        }

        if (tasks.length > 0) await Promise.all(tasks);
    }

    subscribe<TEvent extends Event>(handler: any): void {
        const eventType = this.extractGenericType(handler);
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler as any);
    }

    unsubscribe<TEvent extends Event>(handler: any): void {
        const eventType = this.extractGenericType(handler);
        const list = this.handlers.get(eventType);
        if (list) {
            const index = list.indexOf(handler as any);
            if (index > -1) list.splice(index, 1);
        }
    }

    private extractGenericType(handler: any): string {
        const name = handler?.constructor?.name;
        if (!name) return 'UnknownEvent';
        const match = /Handler<(.*?)>/.exec(name);
        return match ? match[1] : 'UnknownEvent';
    }
}
