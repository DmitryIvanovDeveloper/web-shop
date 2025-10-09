import { describe, it, expect } from 'vitest';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';

describe('SalesSummary', () => {
  it('should create SalesSummary from API response', () => {
    const apiResponse = {
      kpi: {
        totalSales: 125430,
        transactions: 1247,
        arpu: 100.58,
        currency: 'USD'
      },
      trend: [
        { timestamp: '2025-10-01T00:00:00.000Z', value: 82000 },
        { timestamp: '2025-10-02T00:00:00.000Z', value: 84500 }
      ]
    };

    const salesSummary = SalesSummary.fromApiResponse(apiResponse);

    expect(salesSummary.totalSales).toBe(125430);
    expect(salesSummary.transactions).toBe(1247);
    expect(salesSummary.arpu).toBe(100.58);
    expect(salesSummary.currency).toBe('USD');
    expect(salesSummary.trend).toHaveLength(2);
    expect(salesSummary.trend[0].timestamp).toBeInstanceOf(Date);
    expect(salesSummary.trend[0].value).toBe(82000);
  });

  it('should create SalesSummary with constructor', () => {
    const trend = [
      { timestamp: new Date('2025-10-01'), value: 82000 }
    ];

    const salesSummary = new SalesSummary(125430, 1247, 100.58, 'USD', trend);

    expect(salesSummary.totalSales).toBe(125430);
    expect(salesSummary.transactions).toBe(1247);
    expect(salesSummary.arpu).toBe(100.58);
    expect(salesSummary.currency).toBe('USD');
    expect(salesSummary.trend).toEqual(trend);
  });
});




