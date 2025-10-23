export interface Event {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface EventBus {
  // Синхронная публикация (для критических операций)
  publish(event: Event): void;
  
  // Асинхронная публикация (для фоновых операций)
  publishAsync(event: Event): Promise<void>;
  
  // Подписка на события
  subscribe<TEvent extends Event>(handler: any): void;
  
  // Отписка от событий
  unsubscribe<TEvent extends Event>(handler: any): void;
}
