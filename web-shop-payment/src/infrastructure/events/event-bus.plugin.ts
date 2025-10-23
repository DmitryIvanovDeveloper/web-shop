import { IEvent } from "./event";
import { IAsyncEventHandler, ISyncEventHandler } from "./events-handler.plugin";

export interface IEventBus {
    publish<TEvent extends IEvent>(event: TEvent): void;
    publishAsync<TEvent extends IEvent>(event: TEvent): Promise<void>;
    subscribe<TEvent extends IEvent>(handler: ISyncEventHandler<TEvent> | IAsyncEventHandler<TEvent>): void;
    unsubscribe<TEvent extends IEvent>(handler: ISyncEventHandler<TEvent> | IAsyncEventHandler<TEvent>): void;
  }