import { describe, it, expect } from 'vitest';
import { DataFreshness } from '../../domain/value-objects/data-freshness.value-object';

describe('DataFreshness', () => {
  describe('create', () => {
    it('should create a valid DataFreshness instance', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.lastUpdated).toBe(lastUpdated);
      expect(result.data!.targetLatencySeconds).toBe(300);
      expect(result.data!.maxLatencySeconds).toBe(900);
    });

    it('should create with custom latency thresholds', () => {
      const lastUpdated = new Date();
      const result = DataFreshness.create({
        lastUpdated,
        targetLatencySeconds: 60,
        maxLatencySeconds: 180,
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.targetLatencySeconds).toBe(60);
      expect(result.data!.maxLatencySeconds).toBe(180);
    });

    it('should reject invalid date', () => {
      const result = DataFreshness.create({ lastUpdated: new Date('invalid') });
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('valid Date');
    });

    it('should reject negative latency thresholds', () => {
      const result = DataFreshness.create({
        lastUpdated: new Date(),
        targetLatencySeconds: -10,
      });
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('positive');
    });

    it('should reject target latency greater than max latency', () => {
      const result = DataFreshness.create({
        lastUpdated: new Date(),
        targetLatencySeconds: 1000,
        maxLatencySeconds: 500,
      });
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('less than max latency');
    });
  });

  describe('getLagSeconds', () => {
    it('should calculate lag correctly', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:05:00Z'); // 5 minutes later
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getLagSeconds(now)).toBe(300);
    });

    it('should use current time if not provided', () => {
      const lastUpdated = new Date(Date.now() - 10000); // 10 seconds ago
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      const lag = result.data!.getLagSeconds();
      expect(lag).toBeGreaterThanOrEqual(9);
      expect(lag).toBeLessThanOrEqual(11);
    });
  });

  describe('isFresh', () => {
    it('should return true for fresh data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:02:00Z'); // 2 minutes later
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.isFresh(now)).toBe(true);
    });

    it('should return false for old data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:10:00Z'); // 10 minutes later
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.isFresh(now)).toBe(false);
    });
  });

  describe('isStale', () => {
    it('should return false for fresh data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:05:00Z'); // 5 minutes later
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.isStale(now)).toBe(false);
    });

    it('should return true for very old data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:20:00Z'); // 20 minutes later
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.isStale(now)).toBe(true);
    });
  });

  describe('isWarning', () => {
    it('should return true for data between fresh and stale', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:08:00Z'); // 8 minutes later
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.isWarning(now)).toBe(true);
      expect(result.data!.isFresh(now)).toBe(false);
      expect(result.data!.isStale(now)).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return "fresh" for recent data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:02:00Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getStatus(now)).toBe('fresh');
    });

    it('should return "warning" for delayed data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:08:00Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getStatus(now)).toBe('warning');
    });

    it('should return "stale" for very old data', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:20:00Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getStatus(now)).toBe('stale');
    });
  });

  describe('getRelativeTime', () => {
    it('should format seconds correctly', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:00:30Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getRelativeTime(now)).toBe('30 seconds ago');
    });

    it('should format single second correctly', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:00:01Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getRelativeTime(now)).toBe('1 second ago');
    });

    it('should format minutes correctly', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T10:05:00Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getRelativeTime(now)).toBe('5 minutes ago');
    });

    it('should format hours correctly', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const now = new Date('2025-10-08T12:30:00Z');
      const result = DataFreshness.create({ lastUpdated });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.getRelativeTime(now)).toBe('2 hours ago');
    });
  });

  describe('updateTimestamp', () => {
    it('should create new instance with updated timestamp', () => {
      const lastUpdated = new Date('2025-10-08T10:00:00Z');
      const result = DataFreshness.create({ lastUpdated });
      expect(result.isSuccess()).toBe(true);

      const newTimestamp = new Date('2025-10-08T10:05:00Z');
      const updatedResult = result.data!.updateTimestamp(newTimestamp);

      expect(updatedResult.isSuccess()).toBe(true);
      expect(updatedResult.data!.lastUpdated).toBe(newTimestamp);
      expect(updatedResult.data!.targetLatencySeconds).toBe(result.data!.targetLatencySeconds);
      expect(updatedResult.data!.maxLatencySeconds).toBe(result.data!.maxLatencySeconds);
    });
  });
});


