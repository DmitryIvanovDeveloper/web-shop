import { describe, it, expect } from 'vitest';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';

describe('ConversionSummary', () => {
  it('should create ConversionSummary from API response', () => {
    const apiResponse = {
      kpi: {
        conversionRate: 3.8
      },
      channels: [
        { name: 'Organic', value: 45200, percentage: 36.0 },
        { name: 'Paid', value: 53030, percentage: 42.3 }
      ]
    };

    const conversionSummary = ConversionSummary.fromApiResponse(apiResponse);

    expect(conversionSummary.conversionRate).toBe(3.8);
    expect(conversionSummary.channels).toHaveLength(2);
    expect(conversionSummary.channels[0].name).toBe('Organic');
    expect(conversionSummary.channels[0].value).toBe(45200);
  });

  it('should create ConversionSummary with constructor', () => {
    const channels = [
      { name: 'Organic', value: 45200, percentage: 36.0 }
    ];

    const conversionSummary = new ConversionSummary(3.8, channels);

    expect(conversionSummary.conversionRate).toBe(3.8);
    expect(conversionSummary.channels).toEqual(channels);
  });
});




