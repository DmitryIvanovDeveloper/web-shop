export interface RealtimeMessage<T = any> {
  channel: string;
  event: string;
  data: T;
  timestamp: string;
}

export interface RealtimeClientPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe<T>(channel: string, callback: (message: RealtimeMessage<T>) => void): void;
  unsubscribe(channel: string): void;
  isConnected(): boolean;
  onConnectionStatusChange(callback: (connected: boolean) => void): void;
}

