import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeographySummary } from '../domain/entities/geography-summary.entity';

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

describe('Geography Data Flow - Real Data Integration Tests', () => {
  describe('Data Flow Tests with Real JSON Data', () => {
    it('should process real geography data from JSON to entity', () => {
      // Шаг 1: JSON данные (как приходят из API)
      const apiResponse = geographyData;
      
      // Шаг 2: Создание entity из API response
      const geographySummary = GeographySummary.fromApiResponse(apiResponse);
      
      // Шаг 3: Проверка корректности преобразования
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[0].percentage).toBe(45.0);
    });

    it('should validate complete data flow from JSON to business logic', () => {
      // Полный цикл: JSON -> Entity -> Business Logic -> Results
      
      // 1. Исходные JSON данные
      const apiResponse = geographyData;
      
      // 2. Преобразование в domain entity
      const geographySummary = GeographySummary.fromApiResponse(apiResponse);
      
      // 3. Применение бизнес-логики
      const topRegions = geographySummary.regions
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
      
      const totalPercentage = geographySummary.regions.reduce(
        (sum, region) => sum + region.percentage, 0
      );
      
      const majorRegions = geographySummary.regions.filter(r => r.percentage >= 15);
      
      // 4. Проверка результатов
      expect(topRegions[0].country).toBe('US');
      expect(topRegions[1].country).toBe('EU');
      expect(topRegions[2].country).toBe('Asia');
      expect(totalPercentage).toBeCloseTo(100, 1);
      expect(majorRegions).toHaveLength(3);
    });

    it('should handle data transformations in the flow', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Преобразования данных для UI
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
      }));
      
      // Преобразования для аналитики
      const analyticsData = {
        totalRegions: geographySummary.regions.length,
        topRegion: geographySummary.regions.reduce((max, region) => 
          region.percentage > max.percentage ? region : max
        ),
        distribution: {
          major: geographySummary.regions.filter(r => r.percentage >= 15),
          minor: geographySummary.regions.filter(r => r.percentage < 15)
        }
      };
      
      // Проверка корректности преобразований
      expect(chartData).toHaveLength(5);
      expect(chartData[0].label).toBe('US');
      expect(chartData[0].value).toBe(45.0);
      expect(chartData[0].color).toBe('#3b82f6');
      
      expect(analyticsData.totalRegions).toBe(5);
      expect(analyticsData.topRegion.country).toBe('US');
      expect(analyticsData.distribution.major).toHaveLength(3);
      expect(analyticsData.distribution.minor).toHaveLength(2);
    });
  });

  describe('Error Handling in Data Flow', () => {
    it('should handle malformed JSON data gracefully', () => {
      const malformedData = {
        countries: [ // Wrong property name
          { name: 'US', percent: 45 } // Wrong property names
        ]
      };
      
      // GeographySummary.fromApiResponse не валидирует, поэтому regions будет undefined
      const geographySummary = GeographySummary.fromApiResponse(malformedData);
      expect(geographySummary.regions).toBeUndefined();
    });

    it('should handle empty data in the flow', () => {
      const emptyData = { regions: [] };
      const geographySummary = GeographySummary.fromApiResponse(emptyData);
      
      expect(geographySummary.regions).toHaveLength(0);
      
      // Проверяем, что бизнес-логика работает с пустыми данными
      const topRegions = geographySummary.regions
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
      
      expect(topRegions).toHaveLength(0);
    });

    it('should handle data with missing properties', () => {
      const incompleteData = {
        regions: [
          { country: 'US', percentage: 45.0 },
          { country: 'EU' }, // Missing percentage
          { percentage: 15.0 } // Missing country
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(incompleteData);
      
      // Проверяем, что данные обрабатываются (даже если неполные)
      expect(geographySummary.regions).toHaveLength(3);
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[1].percentage).toBeUndefined();
      expect(geographySummary.regions[2].country).toBeUndefined();
    });
  });

  describe('Performance Tests in Data Flow', () => {
    it('should handle large datasets efficiently', () => {
      // Создаем большой набор данных
      const largeDataset = {
        regions: Array.from({ length: 100 }, (_, index) => ({
          country: `Country${index}`,
          percentage: Math.random() * 100
        }))
      };
      
      const startTime = Date.now();
      const geographySummary = GeographySummary.fromApiResponse(largeDataset);
      
      // Применяем бизнес-логику
      const topRegions = geographySummary.regions
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);
      
      const totalPercentage = geographySummary.regions.reduce(
        (sum, region) => sum + region.percentage, 0
      );
      
      const endTime = Date.now();
      
      // Проверяем производительность
      expect(endTime - startTime).toBeLessThan(50); // Должно быть быстро
      expect(geographySummary.regions).toHaveLength(100);
      expect(topRegions).toHaveLength(10);
      expect(typeof totalPercentage).toBe('number');
    });

    it('should handle concurrent data processing', () => {
      const datasets = [
        geographyData,
        { regions: [{ country: 'DE', percentage: 100 }] },
        { regions: [{ country: 'FR', percentage: 50 }, { country: 'IT', percentage: 50 }] }
      ];
      
      const startTime = Date.now();
      
      // Обрабатываем несколько наборов данных параллельно
      const results = datasets.map(data => {
        const summary = GeographySummary.fromApiResponse(data);
        const topRegion = summary.regions.reduce((max, region) => 
          region.percentage > max.percentage ? region : max
        );
        return { summary, topRegion };
      });
      
      const endTime = Date.now();
      
      // Проверяем результаты
      expect(endTime - startTime).toBeLessThan(20); // Должно быть быстро
      expect(results).toHaveLength(3);
      expect(results[0].topRegion.country).toBe('US');
      expect(results[1].topRegion.country).toBe('DE');
      expect(results[2].topRegion.country).toBe('FR');
    });
  });

  describe('Integration with Real Business Scenarios', () => {
    it('should simulate real dashboard data flow', () => {
      // Симулируем реальный сценарий: загрузка данных для дашборда
      
      // 1. Данные приходят с API
      const apiResponse = geographyData;
      
      // 2. Создание domain entity
      const geographySummary = GeographySummary.fromApiResponse(apiResponse);
      
      // 3. Подготовка данных для UI компонентов
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
      }));
      
      const summaryStats = {
        totalRegions: geographySummary.regions.length,
        topRegion: geographySummary.regions.reduce((max, region) => 
          region.percentage > max.percentage ? region : max
        ),
        averagePercentage: geographySummary.regions.reduce(
          (sum, region) => sum + region.percentage, 0
        ) / geographySummary.regions.length
      };
      
      // 4. Проверка готовности данных для UI
      expect(chartData).toHaveLength(5);
      expect(chartData[0].label).toBe('US');
      expect(chartData[0].value).toBe(45.0);
      
      expect(summaryStats.totalRegions).toBe(5);
      expect(summaryStats.topRegion.country).toBe('US');
      expect(summaryStats.averagePercentage).toBeCloseTo(20, 1); // 100/5 = 20
    });

    it('should handle real-time data updates flow', () => {
      // Симулируем обновление данных в реальном времени
      
      // Начальные данные
      const initialData = geographyData;
      let geographySummary = GeographySummary.fromApiResponse(initialData);
      
      // Проверяем начальное состояние
      expect(geographySummary.regions[0].percentage).toBe(45.0);
      
      // Обновленные данные (симулируем изменение)
      const updatedData = {
        ...geographyData,
        regions: geographyData.regions.map(region => ({
          ...region,
          percentage: region.percentage * 1.1 // +10% увеличение
        }))
      };
      
      // Применяем обновления
      geographySummary = GeographySummary.fromApiResponse(updatedData);
      
      // Проверяем, что данные обновились
      expect(geographySummary.regions[0].percentage).toBeCloseTo(49.5, 1); // 45 * 1.1
      expect(geographySummary.regions[1].percentage).toBeCloseTo(33.0, 1); // 30 * 1.1
      
      // Проверяем, что бизнес-логика работает с обновленными данными
      const totalPercentage = geographySummary.regions.reduce(
        (sum, region) => sum + region.percentage, 0
      );
      expect(totalPercentage).toBeCloseTo(110, 1); // 100 * 1.1
    });

    it('should handle data filtering and search scenarios', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Симулируем поиск по регионам
      const searchResults = geographySummary.regions.filter(region =>
        region.country.toLowerCase().includes('us') ||
        region.country.toLowerCase().includes('eu')
      );
      
      expect(searchResults).toHaveLength(2);
      expect(searchResults[0].country).toBe('US');
      expect(searchResults[1].country).toBe('EU');
      
      // Симулируем фильтрацию по проценту
      const highPercentageRegions = geographySummary.regions.filter(region =>
        region.percentage > 25
      );
      
      expect(highPercentageRegions).toHaveLength(2);
      expect(highPercentageRegions[0].country).toBe('US');
      expect(highPercentageRegions[1].country).toBe('EU');
      
      // Симулируем сортировку для таблицы
      const sortedByPercentage = [...geographySummary.regions]
        .sort((a, b) => b.percentage - a.percentage);
      
      expect(sortedByPercentage[0].country).toBe('US');
      expect(sortedByPercentage[4].country).toBe('Other');
    });
  });

  describe('Data Validation and Quality Tests', () => {
    it('should validate data quality in the flow', () => {
      const geographySummary = GeographySummary.fromApiResponse(geographyData);
      
      // Проверяем качество данных
      const validationResults = {
        hasValidStructure: Array.isArray(geographySummary.regions),
        hasValidCountries: geographySummary.regions.every(r => 
          typeof r.country === 'string' && r.country.length > 0
        ),
        hasValidPercentages: geographySummary.regions.every(r => 
          typeof r.percentage === 'number' && r.percentage >= 0 && r.percentage <= 100
        ),
        totalPercentage: geographySummary.regions.reduce((sum, r) => sum + r.percentage, 0)
      };
      
      expect(validationResults.hasValidStructure).toBe(true);
      expect(validationResults.hasValidCountries).toBe(true);
      expect(validationResults.hasValidPercentages).toBe(true);
      expect(validationResults.totalPercentage).toBeCloseTo(100, 1);
    });

    it('should detect data anomalies', () => {
      const anomalousData = {
        regions: [
          { country: 'US', percentage: 45.0 },
          { country: 'EU', percentage: 30.0 },
          { country: 'Asia', percentage: 15.0 },
          { country: 'LATAM', percentage: 7.0 },
          { country: 'Other', percentage: 3.0 },
          { country: 'Anomaly', percentage: 150.0 } // Аномальное значение
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(anomalousData);
      
      // Проверяем обнаружение аномалий
      const anomalies = geographySummary.regions.filter(r => r.percentage > 100);
      const totalPercentage = geographySummary.regions.reduce((sum, r) => sum + r.percentage, 0);
      
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].country).toBe('Anomaly');
      expect(totalPercentage).toBeGreaterThan(100);
    });
  });
});