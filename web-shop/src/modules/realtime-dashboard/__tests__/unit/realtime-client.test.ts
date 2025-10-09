import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockRealtimeClient } from '../../../../infrastructure/realtime/mock-realtime-client';
import { ConsoleLogger } from '../../../../infrastructure/logging/console-logger';

describe('MockRealtimeClient', () => {
  let client: MockRealtimeClient;
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
    client = new MockRealtimeClient(logger);
  });

  afterEach(async () => {
    if (client.isConnected()) {
      await client.disconnect();
    }
  });

  it('should connect and disconnect', async () => {
    expect(client.isConnected()).toBe(false);

    await client.connect();
    expect(client.isConnected()).toBe(true);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  });

  it('should subscribe to channels', async () => {
    await client.connect();

    const messages: any[] = [];
    client.subscribe('test-channel', (message) => {
      messages.push(message);
    });

    // Wait for at least one message
    await new Promise(resolve => setTimeout(resolve, 6000));

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].channel).toBe('test-channel');
  }, 10000);

  it('should unsubscribe from channels', async () => {
    await client.connect();

    const messages: any[] = [];
    client.subscribe('test-channel', (message) => {
      messages.push(message);
    });

    client.unsubscribe('test-channel');

    // Wait to ensure no more messages
    await new Promise(resolve => setTimeout(resolve, 6000));

    expect(messages.length).toBe(0);
  }, 10000);

  it('should notify connection status changes', async () => {
    const statusChanges: boolean[] = [];
    client.onConnectionStatusChange((connected) => {
      statusChanges.push(connected);
    });

    await client.connect();
    expect(statusChanges).toContain(true);

    await client.disconnect();
    expect(statusChanges).toContain(false);
  });
});
