export interface Event {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface EventBus {
  // Асинхронная публикация (для фоновых операций)
  publish(event: Event): Promise<void>;
  
  // Синхронная публикация (для критических операций)
  publishSync(event: Event): Promise<void>;
  
  // Подписка на события
  subscribe(eventType: string, handler: (event: Event) => Promise<void>): void;
  
  // Отписка от событий
  unsubscribe(eventType: string, handler: (event: Event) => Promise<void>): void;
}
