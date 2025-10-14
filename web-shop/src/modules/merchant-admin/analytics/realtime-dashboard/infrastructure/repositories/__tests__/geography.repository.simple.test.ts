import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeographySummary } from '../../../domain/entities/geography-summary.entity';

// Реальные JSON данные (копия из public/mocks/api/geography/summary.json)
const geographyData = {
  "regions": [
    { "country": "US", "percentage": 45.0 },
    { "country": "EU", "percentage": 30.0 },
    { "country": "Asia", "percentage": 15.0 },
    { "country": "LATAM", "percentage": 7.0 },
    { "country": "Other", "percentage": 3.0 }
  ]
};

describe('GeographyRepository - Simple Data Tests', () => {
  describe('GeographySummary Entity Tests with Real Data', () => {
    it('should create GeographySummary from real JSON data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[0].percentage).toBe(45.0);
    });

    it('should preserve data integrity from real JSON', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем, что данные точно соответствуют JSON
      const expectedRegions = [
        { country: 'US', percentage: 45.0 },
        { country: 'EU', percentage: 30.0 },
        { country: 'Asia', percentage: 15.0 },
        { country: 'LATAM', percentage: 7.0 },
        { country: 'Other', percentage: 3.0 }
      ];

      expect(geographySummary.regions).toEqual(expectedRegions);
    });

    it('should validate real data structure', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      geographySummary.regions.forEach(region => {
        expect(region).toHaveProperty('country');
        expect(region).toHaveProperty('percentage');
        expect(typeof region.country).toBe('string');
        expect(typeof region.percentage).toBe('number');
        expect(region.country.length).toBeGreaterThan(0);
        expect(region.percentage).toBeGreaterThanOrEqual(0);
        expect(region.percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should handle business logic with real data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем математику с реальными данными
      const totalPercentage = geographySummary.regions.reduce(
        (sum, region) => sum + region.percentage, 
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);

      // Проверяем, что US - топ регион
      const topRegion = geographySummary.regions.reduce((max, region) => 
        region.percentage > max.percentage ? region : max
      );
      expect(topRegion.country).toBe('US');
      expect(topRegion.percentage).toBe(45.0);
    });

    it('should identify regional distribution patterns with real data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем распределение регионов
      const majorRegions = geographySummary.regions.filter(r => r.percentage >= 15);
      const minorRegions = geographySummary.regions.filter(r => r.percentage < 15);

      expect(majorRegions).toHaveLength(3); // US, EU, Asia
      expect(minorRegions).toHaveLength(2); // LATAM, Other

      // Проверяем, что основные регионы в правильном порядке
      expect(majorRegions[0].country).toBe('US');
      expect(majorRegions[1].country).toBe('EU');
      expect(majorRegions[2].country).toBe('Asia');
    });

    it('should handle data transformations with real data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      const originalRegions = [...geographySummary.regions];

      // Выполняем различные операции с данными
      const sorted = [...geographySummary.regions].sort((a, b) => b.percentage - a.percentage);
      const filtered = geographySummary.regions.filter(r => r.percentage > 20);
      const mapped = geographySummary.regions.map(r => ({ ...r, label: r.country.toUpperCase() }));

      // Проверяем, что оригинальные данные не изменились
      expect(geographySummary.regions).toEqual(originalRegions);
      expect(sorted).toHaveLength(5);
      expect(filtered).toHaveLength(2); // US (45%) и EU (30%)
      expect(mapped[0].label).toBe('US');
    });
  });

  describe('Edge Cases with Real Data', () => {
    it('should handle empty regions data', () => {
      const emptyData = { regions: [] };
      const geographySummary = GeographySummary.fromApiResponse(emptyData);
      
      expect(geographySummary.regions).toHaveLength(0);
    });

    it('should handle single region data', () => {
      const singleRegionData = {
        regions: [{ country: 'United States', percentage: 100 }]
      };
      const geographySummary = GeographySummary.fromApiResponse(singleRegionData);
      
      expect(geographySummary.regions).toHaveLength(1);
      expect(geographySummary.regions[0].country).toBe('United States');
      expect(geographySummary.regions[0].percentage).toBe(100);
    });

    it('should handle malformed API response gracefully', () => {
      const malformedData = {
        countries: [] // Wrong property name
      };
      
      const geographySummary = GeographySummary.fromApiResponse(malformedData);
      expect(geographySummary.regions).toBeUndefined();
    });

    it('should handle zero percentage values', () => {
      const zeroPercentageData = {
        regions: [
          { country: 'United States', percentage: 0 },
          { country: 'Canada', percentage: 100 },
        ]
      };
      const geographySummary = GeographySummary.fromApiResponse(zeroPercentageData);
      
      expect(geographySummary.regions[0].percentage).toBe(0);
      expect(geographySummary.regions[1].percentage).toBe(100);
    });
  });

  describe('Performance and Data Processing with Real Data', () => {
    it('should handle data sorting efficiently', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      const startTime = Date.now();
      const sorted = [...geographySummary.regions].sort((a, b) => b.percentage - a.percentage);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Должно быть быстро
      expect(sorted[0].country).toBe('US');
      expect(sorted[4].country).toBe('Other');
    });

    it('should handle data filtering efficiently', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      const startTime = Date.now();
      const majorRegions = geographySummary.regions.filter(r => r.percentage >= 15);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Должно быть быстро
      expect(majorRegions).toHaveLength(3);
    });

    it('should handle data mapping efficiently', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      const startTime = Date.now();
      const mapped = geographySummary.regions.map(r => ({ 
        ...r, 
        label: r.country.toUpperCase(),
        isMajor: r.percentage >= 15 
      }));
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Должно быть быстро
      expect(mapped[0].label).toBe('US');
      expect(mapped[0].isMajor).toBe(true);
      expect(mapped[4].isMajor).toBe(false);
    });
  });

  describe('Integration Tests with Real Data', () => {
    it('should work end-to-end with real JSON data flow', () => {
      // Полный цикл: JSON Data -> Entity -> Data Processing
      const geographySummary = GeographySummary.fromApiResponse(geographyData);

      // Проверяем, что entity создается корректно
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);

      // Проверяем, что данные можно использовать для бизнес-логики
      const topRegions = geographySummary.regions
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      expect(topRegions[0].country).toBe('US');
      expect(topRegions[1].country).toBe('EU');
      expect(topRegions[2].country).toBe('Asia');

      // Проверяем, что можно вычислить статистику
      const totalPercentage = geographySummary.regions.reduce(
        (sum, region) => sum + region.percentage, 
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should maintain data consistency across operations', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      const originalRegions = [...geographySummary.regions];

      // Выполняем различные операции с данными
      const sorted = [...geographySummary.regions].sort((a, b) => b.percentage - a.percentage);
      const filtered = geographySummary.regions.filter(r => r.percentage > 20);
      const mapped = geographySummary.regions.map(r => ({ ...r, label: r.country.toUpperCase() }));

      // Проверяем, что оригинальные данные не изменились
      expect(geographySummary.regions).toEqual(originalRegions);
      expect(sorted).toHaveLength(5);
      expect(filtered).toHaveLength(2); // US (45%) и EU (30%)
      expect(mapped[0].label).toBe('US');
    });

    it('should support complex data analysis with real data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Анализ распределения
      const distribution = {
        major: geographySummary.regions.filter(r => r.percentage >= 15),
        minor: geographySummary.regions.filter(r => r.percentage < 15),
        total: geographySummary.regions.reduce((sum, r) => sum + r.percentage, 0)
      };

      expect(distribution.major).toHaveLength(3);
      expect(distribution.minor).toHaveLength(2);
      expect(distribution.total).toBeCloseTo(100, 1);

      // Анализ трендов (если бы были данные)
      const sortedByPercentage = [...geographySummary.regions]
        .sort((a, b) => b.percentage - a.percentage);
      
      expect(sortedByPercentage[0].country).toBe('US');
      expect(sortedByPercentage[0].percentage).toBeGreaterThan(sortedByPercentage[1].percentage);
    });
  });
});
