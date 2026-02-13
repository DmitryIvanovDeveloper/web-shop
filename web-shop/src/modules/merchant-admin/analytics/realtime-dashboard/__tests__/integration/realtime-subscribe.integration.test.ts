import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SubscribeRealtimeUseCase } from '../../application/use-cases/subscribe-realtime.use-case';
import { UnsubscribeRealtimeUseCase } from '../../application/use-cases/unsubscribe-realtime.use-case';
import { MockRealtimeClient } from '@/infrastructure/realtime/mock-realtime-client';
import { ConsoleLogger } from '@/infrastructure/logging/console-logger';

describe('Realtime Subscribe/Unsubscribe Integration', () => {
  let realtimeClient: MockRealtimeClient;
  let logger: ConsoleLogger;
  let subscribeUseCase: SubscribeRealtimeUseCase;
  let unsubscribeUseCase: UnsubscribeRealtimeUseCase;

  beforeEach(() => {
    logger = new ConsoleLogger();
    realtimeClient = new MockRealtimeClient(logger);
    subscribeUseCase = new SubscribeRealtimeUseCase(realtimeClient, logger);
    unsubscribeUseCase = new UnsubscribeRealtimeUseCase(realtimeClient, logger);
  });

  afterEach(async () => {
    if (realtimeClient.isConnected()) {
      await realtimeClient.disconnect();
    }
  });

  it('should subscribe to channels and receive updates', async () => {
    const channels = ['dashboard.sales', 'dashboard.revenue'];
    const updates: Map<string, any[]> = new Map();

    await subscribeUseCase.execute(channels, (channel, data) => {
      if (!updates.has(channel)) {
        updates.set(channel, []);
      }
      updates.get(channel)!.push(data);
    });

    expect(realtimeClient.isConnected()).toBe(true);

    // Wait for at least one update on each channel
    await new Promise(resolve => setTimeout(resolve, 6000));

    expect(updates.size).toBeGreaterThan(0);
  }, 10000);

  it('should unsubscribe from channels', async () => {
    const channels = ['dashboard.sales'];
    const updates: any[] = [];

    await subscribeUseCase.execute(channels, (channel, data) => {
      updates.push(data);
    });

    await unsubscribeUseCase.execute(channels);

    expect(realtimeClient.isConnected()).toBe(false);
  });
});




