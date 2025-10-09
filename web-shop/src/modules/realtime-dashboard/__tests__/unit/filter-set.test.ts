import { describe, it, expect } from 'vitest';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { DateRangeFilter } from '../../domain/value-objects/date-range-filter.value-object';
import { GeoFilter } from '../../domain/value-objects/geo-filter.value-object';
import { PaymentFilter } from '../../domain/value-objects/payment-filter.value-object';
import { SourceFilter } from '../../domain/value-objects/source-filter.value-object';
import { CurrencyFilter } from '../../domain/value-objects/currency-filter.value-object';

describe('FilterSet', () => {
  describe('create', () => {
    it('should create filter set with all filters', () => {
      const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
      const geoResult = GeoFilter.create({ countries: ['US', 'UK'] });
      const paymentResult = PaymentFilter.create({ methods: ['card', 'paypal'] });
      const sourceResult = SourceFilter.create({ sources: ['organic', 'paid'] });
      const currencyResult = CurrencyFilter.create({ currency: 'USD' });

      expect(dateRangeResult.isSuccess()).toBe(true);
      expect(geoResult.isSuccess()).toBe(true);
      expect(paymentResult.isSuccess()).toBe(true);
      expect(sourceResult.isSuccess()).toBe(true);
      expect(currencyResult.isSuccess()).toBe(true);

      const result = FilterSet.create({
        dateRange: dateRangeResult.data!,
        geo: geoResult.data!,
        payment: paymentResult.data!,
        source: sourceResult.data!,
        currency: currencyResult.data!,
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.dateRange.preset).toBe('last7days');
      expect(result.data?.geo.countries).toEqual(['US', 'UK']);
      expect(result.data?.payment.methods).toEqual(['card', 'paypal']);
      expect(result.data?.source.sources).toEqual(['organic', 'paid']);
      expect(result.data?.currency.currency).toBe('USD');
    });

    it('should create filter set with defaults for optional filters', () => {
      const dateRangeResult = DateRangeFilter.fromPreset('today', 'day');
      expect(dateRangeResult.isSuccess()).toBe(true);

      const result = FilterSet.create({
        dateRange: dateRangeResult.data!,
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.geo.isEmpty()).toBe(true);
      expect(result.data?.payment.isEmpty()).toBe(true);
      expect(result.data?.source.isEmpty()).toBe(true);
      expect(result.data?.currency.currency).toBe('USD');
    });

    it('should reject filter set without date range', () => {
      const result = FilterSet.create({
        dateRange: null as any,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('Date range filter is required');
    });
  });

  describe('createDefault', () => {
    it('should create default filter set', () => {
      const filterSet = FilterSet.createDefault();

      expect(filterSet.dateRange.preset).toBe('last7days');
      expect(filterSet.dateRange.granularity).toBe('day');
      expect(filterSet.geo.isEmpty()).toBe(true);
      expect(filterSet.payment.isEmpty()).toBe(true);
      expect(filterSet.source.isEmpty()).toBe(true);
      expect(filterSet.currency.currency).toBe('USD');
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false for default filter set', () => {
      const filterSet = FilterSet.createDefault();
      expect(filterSet.hasActiveFilters()).toBe(false);
    });

    it('should return true when geo filter is active', () => {
      const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
      const geoResult = GeoFilter.create({ countries: ['US'] });

      const filterSetResult = FilterSet.create({
        dateRange: dateRangeResult.data!,
        geo: geoResult.data!,
      });

      expect(filterSetResult.isSuccess()).toBe(true);
      expect(filterSetResult.data?.hasActiveFilters()).toBe(true);
    });

    it('should return true when payment filter is active', () => {
      const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
      const paymentResult = PaymentFilter.create({ methods: ['card'] });

      const filterSetResult = FilterSet.create({
        dateRange: dateRangeResult.data!,
        payment: paymentResult.data!,
      });

      expect(filterSetResult.isSuccess()).toBe(true);
      expect(filterSetResult.data?.hasActiveFilters()).toBe(true);
    });
  });

  describe('toQueryParams', () => {
    it('should convert to query params', () => {
      const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
      const geoResult = GeoFilter.create({ countries: ['US', 'UK'] });
      const paymentResult = PaymentFilter.create({ methods: ['card'] });

      const filterSetResult = FilterSet.create({
        dateRange: dateRangeResult.data!,
        geo: geoResult.data!,
        payment: paymentResult.data!,
      });

      expect(filterSetResult.isSuccess()).toBe(true);
      const params = filterSetResult.data!.toQueryParams();

      expect(params.dateRange).toBe('last7days');
      expect(params.granularity).toBe('day');
      expect(params.geo).toBe('US,UK');
      expect(params.payment).toBe('card');
      expect(params.currency).toBe('USD');
      expect(params.source).toBeUndefined(); // Empty source filter
    });
  });

  describe('fromQueryParams', () => {
    it('should create filter set from query params', () => {
      const params = {
        dateRange: 'last7days',
        granularity: 'day',
        geo: 'US,UK',
        payment: 'card,paypal',
        source: 'organic',
        currency: 'USD',
      };

      const result = FilterSet.fromQueryParams(params);

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.dateRange.preset).toBe('last7days');
      expect(result.data?.geo.countries).toEqual(['US', 'UK']);
      expect(result.data?.payment.methods).toEqual(['card', 'paypal']);
      expect(result.data?.source.sources).toEqual(['organic']);
      expect(result.data?.currency.currency).toBe('USD');
    });

    it('should create default filter set from empty params', () => {
      const params = {};

      const result = FilterSet.fromQueryParams(params);

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.dateRange.preset).toBe('last7days');
      expect(result.data?.geo.isEmpty()).toBe(true);
    });

    it('should handle invalid query params', () => {
      const params = {
        dateRange: 'invalid_preset',
      };

      const result = FilterSet.fromQueryParams(params);

      expect(result.isFailure()).toBe(true);
    });
  });
});


