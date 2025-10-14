import { describe, it, expect } from 'vitest';
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

describe('GeographyPanel - Real Data Tests', () => {
  describe('Data Flow Tests with Real JSON Data', () => {
    it('should process real geography data from JSON file', () => {
      // Используем реальные данные из JSON файла
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);
      
      // Проверяем реальные данные
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[0].percentage).toBe(45.0);
      expect(geographySummary.regions[1].country).toBe('EU');
      expect(geographySummary.regions[1].percentage).toBe(30.0);
      expect(geographySummary.regions[2].country).toBe('Asia');
      expect(geographySummary.regions[2].percentage).toBe(15.0);
    });

    it('should validate data structure matches expected format', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем структуру каждой записи
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

    it('should maintain data integrity with real JSON data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем, что данные соответствуют оригинальному JSON
      expect(geographySummary.regions).toEqual(geographyData.regions);
      
      // Проверяем конкретные значения
      const usRegion = geographySummary.regions.find(r => r.country === 'US');
      expect(usRegion?.percentage).toBe(45.0);
      
      const euRegion = geographySummary.regions.find(r => r.country === 'EU');
      expect(euRegion?.percentage).toBe(30.0);
    });
  });

  describe('Business Logic Tests with Real Data', () => {
    it('should handle percentage calculations correctly', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем, что проценты в сумме близки к 100%
      const totalPercentage = geographySummary.regions.reduce(
        (sum, region) => sum + region.percentage, 
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should identify top regions correctly', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Сортируем по проценту для проверки топ регионов
      const sortedRegions = [...geographySummary.regions].sort(
        (a, b) => b.percentage - a.percentage
      );
      
      expect(sortedRegions[0].country).toBe('US');
      expect(sortedRegions[0].percentage).toBe(45.0);
      expect(sortedRegions[1].country).toBe('EU');
      expect(sortedRegions[1].percentage).toBe(30.0);
    });

    it('should handle region categories correctly', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем наличие основных регионов
      const regionNames = geographySummary.regions.map(r => r.country);
      expect(regionNames).toContain('US');
      expect(regionNames).toContain('EU');
      expect(regionNames).toContain('Asia');
      expect(regionNames).toContain('LATAM');
      expect(regionNames).toContain('Other');
    });
  });

  describe('Edge Cases with Real Data', () => {
    it('should handle regions with zero percentage', () => {
      const testDataWithZero = {
        regions: [
          { country: 'US', percentage: 45.0 },
          { country: 'EU', percentage: 30.0 },
          { country: 'Asia', percentage: 0.0 }, // Нулевой процент
          { country: 'LATAM', percentage: 25.0 },
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(testDataWithZero);
      
      expect(geographySummary.regions[2].percentage).toBe(0.0);
      expect(geographySummary.regions[2].country).toBe('Asia');
    });

    it('should handle decimal percentages correctly', () => {
      const testDataWithDecimals = {
        regions: [
          { country: 'US', percentage: 45.5 },
          { country: 'EU', percentage: 30.25 },
          { country: 'Asia', percentage: 15.75 },
          { country: 'Other', percentage: 8.5 },
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(testDataWithDecimals);
      
      expect(geographySummary.regions[0].percentage).toBe(45.5);
      expect(geographySummary.regions[1].percentage).toBe(30.25);
      expect(geographySummary.regions[2].percentage).toBe(15.75);
    });

    it('should handle single region scenario', () => {
      const singleRegionData = {
        regions: [
          { country: 'US', percentage: 100.0 }
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(singleRegionData);
      
      expect(geographySummary.regions).toHaveLength(1);
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[0].percentage).toBe(100.0);
    });
  });

  describe('Data Transformation Tests', () => {
    it('should transform data for chart visualization', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Симулируем преобразование данных для графика (как в GeographyPanel)
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: colors[index % colors.length],
      }));
      
      expect(chartData).toHaveLength(5);
      expect(chartData[0]).toEqual({
        label: 'US',
        value: 45.0,
        color: '#3b82f6'
      });
      expect(chartData[1]).toEqual({
        label: 'EU',
        value: 30.0,
        color: '#8b5cf6'
      });
    });

    it('should apply color scheme to chart data', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: colors[index % colors.length],
      }));
      
      // Проверяем, что цвета применяются корректно
      chartData.forEach((item, index) => {
        expect(item.color).toBe(colors[index % colors.length]);
      });
    });
  });

  describe('Integration Tests with Real Data', () => {
    it('should work end-to-end with real JSON data', () => {
      // Полный цикл: JSON -> Entity -> Data Processing
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем, что entity создается корректно
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);
      
      // Проверяем, что данные можно использовать для UI
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

    it('should maintain consistency across data operations', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем, что данные не изменяются при различных операциях
      const originalRegions = [...geographySummary.regions];
      
      // Сортируем
      const sorted = [...geographySummary.regions].sort((a, b) => b.percentage - a.percentage);
      
      // Фильтруем
      const filtered = geographySummary.regions.filter(r => r.percentage > 20);
      
      // Проверяем, что оригинальные данные не изменились
      expect(geographySummary.regions).toEqual(originalRegions);
      expect(sorted).toHaveLength(5);
      expect(filtered).toHaveLength(2); // US (45%) и EU (30%)
    });
  });
});
