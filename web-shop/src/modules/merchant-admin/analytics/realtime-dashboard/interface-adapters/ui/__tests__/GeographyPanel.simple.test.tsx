import { describe, it, expect } from 'vitest';
import { GeographySummary } from '../../../domain/entities/geography-summary.entity';

describe('GeographyPanel - Simple Tests', () => {
  const mockGeographyData = {
    regions: [
      { country: 'United States', percentage: 45.2 },
      { country: 'Canada', percentage: 23.1 },
      { country: 'United Kingdom', percentage: 15.7 },
    ]
  };

  describe('Data Flow Tests', () => {
    it('should create GeographySummary entity from API response', () => {
      const geographySummary = GeographySummary.fromApiResponse(mockGeographyData);
      
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(3);
      expect(geographySummary.regions[0].country).toBe('United States');
      expect(geographySummary.regions[0].percentage).toBe(45.2);
    });

    it('should handle empty regions data', () => {
      const emptyData = { regions: [] };
      const geographySummary = GeographySummary.fromApiResponse(emptyData);
      
      expect(geographySummary.regions).toHaveLength(0);
    });

    it('should preserve data integrity', () => {
      const geographySummary = GeographySummary.fromApiResponse(mockGeographyData);
      
      expect(geographySummary.regions[0].country).toBe(mockGeographyData.regions[0].country);
      expect(geographySummary.regions[0].percentage).toBe(mockGeographyData.regions[0].percentage);
      expect(geographySummary.regions[1].country).toBe(mockGeographyData.regions[1].country);
      expect(geographySummary.regions[1].percentage).toBe(mockGeographyData.regions[1].percentage);
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate region data structure', () => {
      const geographySummary = GeographySummary.fromApiResponse(mockGeographyData);
      
      geographySummary.regions.forEach(region => {
        expect(region).toHaveProperty('country');
        expect(region).toHaveProperty('percentage');
        expect(typeof region.country).toBe('string');
        expect(typeof region.percentage).toBe('number');
        expect(region.country.length).toBeGreaterThan(0);
        expect(region.percentage).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle edge case percentages', () => {
      const edgeCaseData = {
        regions: [
          { country: 'US', percentage: 0 },
          { country: 'CA', percentage: 100 },
          { country: 'UK', percentage: 50.5 },
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(edgeCaseData);
      
      expect(geographySummary.regions[0].percentage).toBe(0);
      expect(geographySummary.regions[1].percentage).toBe(100);
      expect(geographySummary.regions[2].percentage).toBe(50.5);
    });
  });

  describe('Entity Factory Tests', () => {
    it('should work with GeographySummary.fromApiResponse factory method', () => {
      const apiResponse = {
        regions: [
          { country: 'Germany', percentage: 25.3 },
          { country: 'France', percentage: 18.7 },
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(apiResponse);
      
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toEqual(apiResponse.regions);
    });

    it('should handle malformed API response gracefully', () => {
      const malformedData = {
        countries: [ // Wrong property name
          { name: 'US', percent: 50 } // Wrong property names
        ]
      };
      
      // GeographySummary.fromApiResponse doesn't validate, so it will pass undefined regions
      const geographySummary = GeographySummary.fromApiResponse(malformedData);
      expect(geographySummary.regions).toBeUndefined();
    });
  });
});
