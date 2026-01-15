export interface IEvent {
  type: string;
}

export interface EventBus {
  // Синхронная публикация (для критических операций)
  publish(event: IEvent): void;

  // Асинхронная публикация (для фоновых операций)
  publishAsync(event: IEvent): Promise<void>;

  // Подписка на события
  subscribe<TEvent extends IEvent>(handler: any): void;

  // Отписка от событий
  unsubscribe<TEvent extends IEvent>(handler: any): void;
}
