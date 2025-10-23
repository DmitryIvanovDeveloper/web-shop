import { IEvent } from "./event";

export interface ISyncEventHandler<TEvent extends IEvent> {
    canHandle(event: TEvent): boolean;
    handle(event: TEvent): void;
  }
  
  export interface IAsyncEventHandler<TEvent extends IEvent> {
    canHandle(event: TEvent): boolean;
    handleAsync(event: TEvent): Promise<void>;
  }