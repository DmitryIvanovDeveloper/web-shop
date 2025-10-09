import { describe, it, expect } from 'vitest';
import { DateRangeFilter } from '../../domain/value-objects/date-range-filter.value-object';

describe('DateRangeFilter', () => {
  describe('fromPreset', () => {
    it('should create filter for today preset', () => {
      const result = DateRangeFilter.fromPreset('today', 'day');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.preset).toBe('today');
      expect(result.data?.granularity).toBe('day');
      expect(result.data?.from).toBeInstanceOf(Date);
      expect(result.data?.to).toBeInstanceOf(Date);
    });

    it('should create filter for last7days preset', () => {
      const result = DateRangeFilter.fromPreset('last7days', 'day');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.preset).toBe('last7days');
      const daysDiff = result.data?.to && result.data?.from 
        ? Math.round((result.data.to.getTime() - result.data.from.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      expect(daysDiff).toBe(6); // 7 days inclusive
    });

    it('should reject custom preset without dates', () => {
      const result = DateRangeFilter.fromPreset('custom', 'day');
      
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('Custom preset requires explicit from and to dates');
    });
  });

  describe('create', () => {
    it('should create custom date range', () => {
      const from = new Date('2025-10-01');
      const to = new Date('2025-10-08');
      
      const result = DateRangeFilter.create({
        preset: 'custom',
        granularity: 'day',
        from,
        to,
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.from).toEqual(from);
      expect(result.data?.to).toEqual(to);
    });

    it('should reject custom preset without dates', () => {
      const result = DateRangeFilter.create({
        preset: 'custom',
        granularity: 'day',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('Custom date range requires from and to dates');
    });

    it('should reject invalid date range (from > to)', () => {
      const result = DateRangeFilter.create({
        preset: 'custom',
        granularity: 'day',
        from: new Date('2025-10-08'),
        to: new Date('2025-10-01'),
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('From date must be before to date');
    });
  });

  describe('toQueryParams', () => {
    it('should convert to query params for preset', () => {
      const filterResult = DateRangeFilter.fromPreset('last7days', 'week');
      
      expect(filterResult.isSuccess()).toBe(true);
      const params = filterResult.data!.toQueryParams();
      
      expect(params.dateRange).toBe('last7days');
      expect(params.granularity).toBe('week');
      expect(params.from).toBeUndefined();
      expect(params.to).toBeUndefined();
    });

    it('should convert custom range to query params', () => {
      const from = new Date('2025-10-01');
      const to = new Date('2025-10-08');
      const filterResult = DateRangeFilter.create({
        preset: 'custom',
        granularity: 'day',
        from,
        to,
      });

      expect(filterResult.isSuccess()).toBe(true);
      const params = filterResult.data!.toQueryParams();

      expect(params.dateRange).toBe('custom');
      expect(params.from).toBe('2025-10-01');
      expect(params.to).toBe('2025-10-08');
    });
  });

  describe('fromQueryParams', () => {
    it('should create filter from query params (preset)', () => {
      const params = {
        dateRange: 'last7days',
        granularity: 'day',
      };

      const result = DateRangeFilter.fromQueryParams(params);

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.preset).toBe('last7days');
      expect(result.data?.granularity).toBe('day');
    });

    it('should create filter from query params (custom)', () => {
      const params = {
        dateRange: 'custom',
        granularity: 'day',
        from: '2025-10-01',
        to: '2025-10-08',
      };

      const result = DateRangeFilter.fromQueryParams(params);

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.preset).toBe('custom');
      expect(result.data?.from).toEqual(new Date('2025-10-01'));
      expect(result.data?.to).toEqual(new Date('2025-10-08'));
    });

    it('should reject invalid query params', () => {
      const params = {
        dateRange: 'custom',
        granularity: 'day',
        // Missing from/to
      };

      const result = DateRangeFilter.fromQueryParams(params);

      expect(result.isFailure()).toBe(true);
    });
  });
});


