import { injectable, inject } from 'inversify';
import type { Container } from 'inversify';
import { IAsyncEventHandler, ISyncEventHandler } from './events-handler.plugin';
import { EventBus as EventBusPort, IEvent } from '../../application/ports/event-bus.port';
import { ROOT_TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';
import { container } from '../bootstrap/container';

@injectable()
export class EventBus implements EventBusPort {
    private handlers: Map<string, (ISyncEventHandler<any> | IAsyncEventHandler<any>)[]> = new Map();
    
    constructor(
        @inject(ROOT_TYPES.Logger) 
        private logger: Logger
    ) {}

    publish(event: IEvent): void {
        const eventType = event.type;
        this.logger.info(`[EventBus] Publishing sync event: ${eventType}`);
        
        const handlers = this.handlers.get(eventType) || [];

        for (const handler of handlers) {
            if ('handle' in handler && (handler as ISyncEventHandler<any>).canHandle(event)) {
                (handler as ISyncEventHandler<any>).handle(event);
            }
        }

        const fromContainer = container.getAll<ISyncEventHandler<any>>(
            Symbol.for(`ISyncEventHandler<${eventType}>`),
        );

        for (const handler of fromContainer) {
            if (!handler.canHandle(event)) {
                continue;
            }
            handler.handle(event);
        }
    }

    async publishAsync(event: IEvent): Promise<void> {
        const eventType = event.type;
        this.logger.info(`[EventBus] Publishing async event: ${eventType}`);
        
        const handlers = this.handlers.get(eventType) || [];
        const tasks: Promise<void>[] = [];

        for (const handler of handlers) {
            if ('handleAsync' in handler && (handler as IAsyncEventHandler<any>).canHandle(event)) {
                tasks.push((handler as IAsyncEventHandler<any>).handleAsync(event));
            }
        }

        const asyncHandlers = container.getAll<IAsyncEventHandler<any>>(
            Symbol.for(`IAsyncEventHandler<${eventType}>`),
        );

        for (const handler of asyncHandlers) {
            if (handler.canHandle(event)) {
                tasks.push(handler.handleAsync(event));
            }
        }

        if (tasks.length > 0) await Promise.all(tasks);
    }

    subscribe<TEvent extends IEvent>(handler: any): void {
        const eventType = this.extractGenericType(handler);
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler as any);
    }

    unsubscribe<TEvent extends IEvent>(handler: any): void {
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
