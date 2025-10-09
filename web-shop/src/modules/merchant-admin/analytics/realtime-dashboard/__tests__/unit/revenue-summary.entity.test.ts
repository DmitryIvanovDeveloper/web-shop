import { describe, it, expect } from 'vitest';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';

describe('RevenueSummary', () => {
  it('should create RevenueSummary from API response', () => {
    const apiResponse = {
      kpi: {
        netIncome: 98250,
        monthlyGrowth: 22.8,
        currency: 'USD'
      },
      trend: [
        { timestamp: '2025-10-01T00:00:00.000Z', value: 72000 },
        { timestamp: '2025-10-02T00:00:00.000Z', value: 75500 }
      ]
    };

    const revenueSummary = RevenueSummary.fromApiResponse(apiResponse);

    expect(revenueSummary.netIncome).toBe(98250);
    expect(revenueSummary.monthlyGrowth).toBe(22.8);
    expect(revenueSummary.currency).toBe('USD');
    expect(revenueSummary.trend).toHaveLength(2);
    expect(revenueSummary.trend[0].timestamp).toBeInstanceOf(Date);
    expect(revenueSummary.trend[0].value).toBe(72000);
  });

  it('should create RevenueSummary with constructor', () => {
    const trend = [
      { timestamp: new Date('2025-10-01'), value: 72000 }
    ];

    const revenueSummary = new RevenueSummary(98250, 22.8, 'USD', trend);

    expect(revenueSummary.netIncome).toBe(98250);
    expect(revenueSummary.monthlyGrowth).toBe(22.8);
    expect(revenueSummary.currency).toBe('USD');
    expect(revenueSummary.trend).toEqual(trend);
  });
});




