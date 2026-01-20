export interface Event {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface EventBus {
  
  publish(event: Event): Promise<void>;

  publishSync(event: Event): Promise<void>;

  subscribe(eventType: string, handler: (event: Event) => Promise<void>): void;

  unsubscribe(eventType: string, handler: (event: Event) => Promise<void>): void;
}
