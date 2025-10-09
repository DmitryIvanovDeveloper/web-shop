import { describe, it, expect } from 'vitest';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';

describe('GeographySummary', () => {
  it('should create GeographySummary from API response', () => {
    const apiResponse = {
      regions: [
        { country: 'US', percentage: 45.0 },
        { country: 'EU', percentage: 30.0 }
      ]
    };

    const geographySummary = GeographySummary.fromApiResponse(apiResponse);

    expect(geographySummary.regions).toHaveLength(2);
    expect(geographySummary.regions[0].country).toBe('US');
    expect(geographySummary.regions[0].percentage).toBe(45.0);
  });

  it('should create GeographySummary with constructor', () => {
    const regions = [
      { country: 'US', percentage: 45.0 }
    ];

    const geographySummary = new GeographySummary(regions);

    expect(geographySummary.regions).toEqual(regions);
  });
});




