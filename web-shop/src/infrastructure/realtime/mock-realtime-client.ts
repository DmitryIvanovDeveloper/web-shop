import { injectable, inject } from 'inversify';
import { RealtimeClientPort, RealtimeMessage } from '../../application/ports/realtime-client.port';
import type { Logger } from '../../application/ports/logger.port';
import { TYPES } from '../bootstrap/types';

@injectable()
export class MockRealtimeClient implements RealtimeClientPort {
  private connected: boolean = false;
  private subscriptions: Map<string, ((message: RealtimeMessage) => void)[]> = new Map();
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async connect(): Promise<void> {
    this.logger.info('MockRealtimeClient: Connecting...');
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate connection delay
    
    this.connected = true;
    this.logger.info('MockRealtimeClient: Connected');
    this.notifyConnectionStatus(true);
  }

  async disconnect(): Promise<void> {
    this.logger.info('MockRealtimeClient: Disconnecting...');
    
    // Stop all update intervals
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();
    
    this.connected = false;
    this.subscriptions.clear();
    this.notifyConnectionStatus(false);
    
    this.logger.info('MockRealtimeClient: Disconnected');
  }

  subscribe<T>(channel: string, callback: (message: RealtimeMessage<T>) => void): void {
    this.logger.info(`MockRealtimeClient: Subscribing to channel ${channel}`);
    
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
    }
    
    this.subscriptions.get(channel)!.push(callback as any);
    
    // Start mock updates for this channel
    this.startMockUpdates(channel);
  }

  unsubscribe(channel: string): void {
    this.logger.info(`MockRealtimeClient: Unsubscribing from channel ${channel}`);
    
    this.subscriptions.delete(channel);
    
    // Stop mock updates for this channel
    const interval = this.updateIntervals.get(channel);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(channel);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  onConnectionStatusChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  private startMockUpdates(channel: string): void {
    // Clear existing interval if any
    const existingInterval = this.updateIntervals.get(channel);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Send mock updates every 5 seconds
    const interval = setInterval(() => {
      if (!this.connected || !this.subscriptions.has(channel)) {
        return;
      }

      const mockData = this.generateMockData(channel);
      const message: RealtimeMessage = {
        channel,
        event: 'update',
        data: mockData,
        timestamp: new Date().toISOString(),
      };

      const callbacks = this.subscriptions.get(channel) || [];
      callbacks.forEach(callback => callback(message));
    }, 5000);

    this.updateIntervals.set(channel, interval);
  }

  private generateMockData(channel: string): any {
    const timestamp = new Date();
    const value = Math.floor(Math.random() * 100000) + 50000;

    switch (channel) {
      case 'dashboard.sales':
        return {
          totalSales: value,
          transactions: Math.floor(value / 100),
          arpu: Math.floor(value / (value / 100)),
          timestamp: timestamp.toISOString(),
        };
      
      case 'dashboard.revenue':
        return {
          netIncome: value * 0.8,
          monthlyGrowth: (Math.random() * 10) - 2,
          timestamp: timestamp.toISOString(),
        };
      
      case 'dashboard.geography':
        return {
          regions: [
            { country: 'US', percentage: 40 + Math.random() * 10 },
            { country: 'EU', percentage: 25 + Math.random() * 10 },
            { country: 'Asia', percentage: 15 + Math.random() * 10 },
            { country: 'LATAM', percentage: 5 + Math.random() * 5 },
            { country: 'Other', percentage: 2 + Math.random() * 3 },
          ],
          timestamp: timestamp.toISOString(),
        };
      
      case 'dashboard.conversion':
        return {
          conversionRate: 3.5 + Math.random() * 2,
          channels: [
            { name: 'Organic', value: value * 0.36, percentage: 36.0 },
            { name: 'Paid', value: value * 0.42, percentage: 42.3 },
            { name: 'Social', value: value * 0.15, percentage: 15.1 },
            { name: 'Email', value: value * 0.07, percentage: 6.6 },
          ],
          timestamp: timestamp.toISOString(),
        };
      
      default:
        return { timestamp: timestamp.toISOString() };
    }
  }

  // Test helper method
  simulateMessage(message: RealtimeMessage): void {
    const callbacks = this.subscriptions.get(message.channel);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }
}
