import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RetryHttpClient } from '../../../infrastructure/http/retry-http-client';
import { HttpClientMock } from '../../../infrastructure/http/http-client.mock';
import { RetryConfig } from '../../domain/value-objects/retry-config.value-object';
import { ThrottledRealtimeClient } from '../../../infrastructure/realtime/throttled-realtime-client';
import { MockRealtimeClient } from '../../../infrastructure/realtime/mock-realtime-client';
import { ThrottleConfig } from '../../domain/value-objects/throttle-config.value-object';
import { Logger } from '../../../application/ports/logger.port';

// Mock Logger
const mockLogger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe('Error Handling Integration', () => {
  describe('RetryHttpClient', () => {
    let retryClient: RetryHttpClient;
    let mockClient: HttpClientMock;
    let retryConfig: RetryConfig;

    beforeEach(() => {
      mockClient = new HttpClientMock();
      retryConfig = RetryConfig.create({
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
        retryableStatusCodes: [500, 502, 503],
      }).data!;
      retryClient = new RetryHttpClient(mockClient, retryConfig, mockLogger);
    });

    it('should retry on retryable status codes', async () => {
      // Mock client to return 500 error first, then success
      let attemptCount = 0;
      mockClient.request = vi.fn().mockImplementation(async (request) => {
        attemptCount++;
        if (attemptCount === 1) {
          return {
            data: null,
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
          };
        }
        // Second attempt returns success
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
        };
      });

      const response = await retryClient.request({
        url: '/api/test',
        method: 'GET',
      });

      expect(attemptCount).toBe(2);
      expect(response.status).toBe(200);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Request failed, retrying in 100ms',
        expect.objectContaining({
          status: 500,
          attempt: 1,
        })
      );
    });

    it('should not retry on non-retryable status codes', async () => {
      let attemptCount = 0;
      const originalRequest = mockClient.request.bind(mockClient);
      mockClient.request = vi.fn().mockImplementation(async (request) => {
        attemptCount++;
        return {
          data: null,
          status: 404,
          statusText: 'Not Found',
          headers: {},
        };
      });

      const response = await retryClient.request({
        url: '/api/test',
        method: 'GET',
      });

      expect(attemptCount).toBe(1);
      expect(response.status).toBe(404);
    });

    it('should stop retrying after max attempts', async () => {
      let attemptCount = 0;
      mockClient.request = vi.fn().mockImplementation(async (request) => {
        attemptCount++;
        return {
          data: null,
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
        };
      });

      const response = await retryClient.request({
        url: '/api/test',
        method: 'GET',
      });

      expect(attemptCount).toBe(3);
      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Request failed permanently',
        expect.objectContaining({
          attempt: 3,
          maxAttempts: 3,
        })
      );
    });
  });

  describe('ThrottledRealtimeClient', () => {
    let throttledClient: ThrottledRealtimeClient;
    let mockRealtimeClient: MockRealtimeClient;
    let throttleConfig: ThrottleConfig;

    beforeEach(() => {
      mockRealtimeClient = new MockRealtimeClient(mockLogger);
      throttleConfig = ThrottleConfig.create({
        maxUpdatesPerSecond: 10,
        burstLimit: 3,
        cooldownMs: 1000,
      }).data!;
      throttledClient = new ThrottledRealtimeClient(mockRealtimeClient, throttleConfig, mockLogger);
    });

    it('should throttle updates based on rate limit', async () => {
      const callback = vi.fn();
      throttledClient.subscribe('test-channel', callback);

      // Send multiple updates rapidly
      const message = { channel: 'test-channel', event: 'update', data: { test: 'data' }, timestamp: Date.now().toString() };
      
      // First update should go through immediately
      mockRealtimeClient.simulateMessage(message);
      expect(callback).toHaveBeenCalledTimes(1);

      // Second update should be throttled
      mockRealtimeClient.simulateMessage(message);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, second is queued

      // Wait for throttling to process
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should respect burst limit', async () => {
      const callback = vi.fn();
      throttledClient.subscribe('test-channel', callback);

      const message = { channel: 'test-channel', event: 'update', data: { test: 'data' }, timestamp: Date.now().toString() };
      
      // Send burst limit + 1 updates
      for (let i = 0; i < 4; i++) {
        mockRealtimeClient.simulateMessage(message);
      }

      // First message should go through immediately
      expect(callback).toHaveBeenCalledTimes(1);
      expect(throttledClient.getQueueSize()).toBe(3); // 3 messages queued
    });

    it('should clear queue', async () => {
      const callback = vi.fn();
      throttledClient.subscribe('test-channel', callback);

      const message = { channel: 'test-channel', event: 'update', data: { test: 'data' }, timestamp: Date.now().toString() };
      
      // Send multiple updates to fill queue
      for (let i = 0; i < 5; i++) {
        mockRealtimeClient.simulateMessage(message);
      }

      expect(throttledClient.getQueueSize()).toBeGreaterThan(0);
      
      throttledClient.clearQueue();
      expect(throttledClient.getQueueSize()).toBe(0);
      expect(mockLogger.info).toHaveBeenCalledWith('Update queue cleared');
    });
  });
});
