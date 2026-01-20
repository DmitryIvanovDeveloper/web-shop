export interface IEvent {
  type: string;
}

export interface EventBus {
    publish(event: IEvent): void;

    publishAsync(event: IEvent): Promise<void>;

    subscribe<TEvent extends IEvent>(handler: any): void;

    unsubscribe<TEvent extends IEvent>(handler: any): void;
}
