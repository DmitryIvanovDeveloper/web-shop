import { Event } from '../../application/ports/event-bus.port';

export interface ISyncEventHandler<TEvent extends Event> {
  canHandle(event: TEvent): boolean;
  handle(event: TEvent): void;
}

export interface IAsyncEventHandler<TEvent extends Event> {
  canHandle(event: TEvent): boolean;
  handleAsync(event: TEvent): Promise<void>;
}


