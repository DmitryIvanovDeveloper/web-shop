import { FilterApplier } from '../filter-applier';

describe('FilterApplier', () => {
  const sampleData = [
    {
      timestamp: new Date('2025-10-05'),
      country: 'US',
      paymentMethod: 'card',
      currency: 'USD',
      amount: 100,
      source: 'organic',
    },
    {
      timestamp: new Date('2025-10-08'),
      country: 'GB',
      paymentMethod: 'paypal',
      currency: 'GBP',
      amount: 200,
      source: 'paid',
    },
    {
      timestamp: new Date('2025-10-12'),
      country: 'DE',
      paymentMethod: 'carrier_billing',
      currency: 'EUR',
      amount: 150,
      source: 'direct',
    },
  ];

  describe('applyDateFilter', () => {
    it('should filter data by date range', () => {
      const dateRange = {
        start: '2025-10-03T00:00:00.000Z',
        end: '2025-10-10T23:59:59.999Z',
      };

      const filtered = FilterApplier.applyDateFilter(sampleData, dateRange);
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].timestamp).toEqual(new Date('2025-10-05'));
      expect(filtered[1].timestamp).toEqual(new Date('2025-10-08'));
    });
  });

  describe('applyGeographyFilter', () => {
    it('should filter data by countries', () => {
      const geography = {
        countries: ['US', 'GB'],
      };

      const filtered = FilterApplier.applyGeographyFilter(sampleData, geography);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(d => d.country)).toEqual(['US', 'GB']);
    });
  });

  describe('applyPaymentFilter', () => {
    it('should filter data by payment methods', () => {
      const payment = {
        methods: ['card', 'paypal'],
      };

      const filtered = FilterApplier.applyPaymentFilter(sampleData, payment);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(d => d.paymentMethod)).toEqual(['card', 'paypal']);
    });
  });

  describe('applyCurrencyFilter', () => {
    it('should filter data by currencies', () => {
      const currencies = ['USD', 'EUR'];

      const filtered = FilterApplier.applyCurrencyFilter(sampleData, currencies);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(d => d.currency)).toEqual(['USD', 'EUR']);
    });
  });

  describe('applyAmountFilter', () => {
    it('should filter data by amount range', () => {
      const filtered = FilterApplier.applyAmountFilter(sampleData, 100, 150);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(d => d.amount)).toEqual([100, 150]);
    });
  });

  describe('applyAcquisitionFilter', () => {
    it('should filter data by acquisition sources', () => {
      const acquisition = {
        sources: ['organic', 'paid'],
      };

      const filtered = FilterApplier.applyAcquisitionFilter(sampleData, acquisition);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(d => d.source)).toEqual(['organic', 'paid']);
    });
  });

  describe('applyAllFilters', () => {
    it('should apply all filters together', () => {
      const filters = {
        dateRange: {
          start: '2025-10-03T00:00:00.000Z',
          end: '2025-10-10T23:59:59.999Z',
        },
        geography: {
          countries: ['US', 'GB', 'DE'],
        },
        payment: {
          methods: ['card', 'paypal'],
        },
        currency: ['USD', 'GBP'],
        minAmount: 50,
        maxAmount: 250,
      };

      const filtered = FilterApplier.applyAllFilters(sampleData, filters);
      
      // Should only include US (card, USD) and GB (paypal, GBP) within date range
      expect(filtered).toHaveLength(2);
      expect(filtered.map(d => d.country)).toEqual(['US', 'GB']);
    });
  });
});

