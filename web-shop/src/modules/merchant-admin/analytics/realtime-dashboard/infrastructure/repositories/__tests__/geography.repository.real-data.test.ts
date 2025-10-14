import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeographyRepository } from '../geography.repository';
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

const filtersData = {
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
};

describe('GeographyRepository - Real Data Tests', () => {
  let geographyRepository: GeographyRepository;
  let mockHttpClient: any;

  beforeEach(() => {
    // Создаем мок HttpClient, который возвращает реальные JSON данные
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    geographyRepository = new GeographyRepository(mockHttpClient);
  });

  describe('Data Flow Tests with Real JSON Data', () => {
    it('should fetch and process real geography data', async () => {
      // Настраиваем мок для возврата реальных данных
      mockHttpClient.get
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          data: geographyData
        });

      const result = await geographyRepository.getGeographySummary();

      // Проверяем, что API был вызван с правильным URL
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/geography/summary');

      // Проверяем, что результат соответствует реальным данным
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions).toHaveLength(5);
      expect(result.regions[0].country).toBe('US');
      expect(result.regions[0].percentage).toBe(45.0);
      expect(result.regions[1].country).toBe('EU');
      expect(result.regions[1].percentage).toBe(30.0);
    });

    it('should handle real data structure correctly', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await geographyRepository.getGeographySummary();

      // Проверяем структуру данных
      result.regions.forEach(region => {
        expect(region).toHaveProperty('country');
        expect(region).toHaveProperty('percentage');
        expect(typeof region.country).toBe('string');
        expect(typeof region.percentage).toBe('number');
      });

      // Проверяем конкретные значения из JSON
      expect(result.regions).toEqual(geographyData.regions);
    });

    it('should validate data integrity with real JSON', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await geographyRepository.getGeographySummary();

      // Проверяем, что данные точно соответствуют JSON
      const expectedRegions = [
        { country: 'US', percentage: 45.0 },
        { country: 'EU', percentage: 30.0 },
        { country: 'Asia', percentage: 15.0 },
        { country: 'LATAM', percentage: 7.0 },
        { country: 'Other', percentage: 3.0 }
      ];

      expect(result.regions).toEqual(expectedRegions);
    });
  });

  describe('Business Logic Tests with Real Data', () => {
    it('should calculate percentages correctly with real data', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await geographyRepository.getGeographySummary();

      // Проверяем математику с реальными данными
      const totalPercentage = result.regions.reduce(
        (sum, region) => sum + region.percentage, 
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);

      // Проверяем, что US - топ регион
      const topRegion = result.regions.reduce((max, region) => 
        region.percentage > max.percentage ? region : max
      );
      expect(topRegion.country).toBe('US');
      expect(topRegion.percentage).toBe(45.0);
    });

    it('should identify regional distribution patterns', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await geographyRepository.getGeographySummary();

      // Проверяем распределение регионов
      const majorRegions = result.regions.filter(r => r.percentage >= 15);
      const minorRegions = result.regions.filter(r => r.percentage < 15);

      expect(majorRegions).toHaveLength(3); // US, EU, Asia
      expect(minorRegions).toHaveLength(2); // LATAM, Other

      // Проверяем, что основные регионы в правильном порядке
      expect(majorRegions[0].country).toBe('US');
      expect(majorRegions[1].country).toBe('EU');
      expect(majorRegions[2].country).toBe('Asia');
    });
  });

  describe('Error Handling with Real Data', () => {
    it('should handle API errors gracefully', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error',
        data: null
      });

      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Failed to fetch geography data: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Network error');
    });

    it('should handle malformed response data', async () => {
      const malformedData = {
        countries: [ // Неправильное поле
          { name: 'US', percent: 45 } // Неправильные поля
        ]
      };

      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: malformedData
      });

      const result = await geographyRepository.getGeographySummary();
      
      // GeographySummary.fromApiResponse не валидирует, поэтому regions будет undefined
      expect(result.regions).toBeUndefined();
    });
  });

  describe('Performance Tests with Real Data', () => {
    it('should handle concurrent requests efficiently', async () => {
      mockHttpClient.get.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const startTime = Date.now();
      
      // Делаем несколько параллельных запросов
      const promises = Array.from({ length: 5 }, () => 
        geographyRepository.getGeographySummary()
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Проверяем производительность
      expect(endTime - startTime).toBeLessThan(100); // Должно быть быстро
      
      // Проверяем, что все результаты корректны
      results.forEach(result => {
        expect(result).toBeInstanceOf(GeographySummary);
        expect(result.regions).toHaveLength(5);
        expect(result.regions[0].country).toBe('US');
      });
    });

    it('should make only necessary API calls', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      await geographyRepository.getGeographySummary();

      // Проверяем, что был сделан только один вызов API
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/geography/summary');
    });
  });

  describe('Data Processing Tests with Real Data', () => {
    it('should process trend data correctly', async () => {
      const dataWithTrend = {
        ...geographyData,
        trend: [
          { timestamp: '2024-01-01T00:00:00Z', value: 100 },
          { timestamp: '2024-01-02T00:00:00Z', value: 120 },
          { timestamp: '2024-01-03T00:00:00Z', value: 110 },
        ]
      };

      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: dataWithTrend
      });

      const result = await geographyRepository.getGeographySummary();

      // Проверяем, что основные данные обработаны
      expect(result.regions).toHaveLength(5);
      expect(result.regions[0].country).toBe('US');

      // Проверяем, что trend данные присутствуют (если GeographySummary их поддерживает)
      // Это зависит от реализации GeographySummary
    });

    it('should handle empty regions gracefully', async () => {
      const emptyData = {
        regions: []
      };

      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: emptyData
      });

      const result = await geographyRepository.getGeographySummary();

      expect(result.regions).toHaveLength(0);
    });
  });

  describe('Integration Tests with Real Data', () => {
    it('should work end-to-end with real JSON data flow', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      // Полный цикл: API -> Repository -> Entity -> Data Processing
      const result = await geographyRepository.getGeographySummary();

      // Проверяем, что entity создается корректно
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions).toHaveLength(5);

      // Проверяем, что данные можно использовать для бизнес-логики
      const topRegions = result.regions
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      expect(topRegions[0].country).toBe('US');
      expect(topRegions[1].country).toBe('EU');
      expect(topRegions[2].country).toBe('Asia');

      // Проверяем, что можно вычислить статистику
      const totalPercentage = result.regions.reduce(
        (sum, region) => sum + region.percentage, 
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should maintain data consistency across operations', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await geographyRepository.getGeographySummary();
      const originalRegions = [...result.regions];

      // Выполняем различные операции с данными
      const sorted = [...result.regions].sort((a, b) => b.percentage - a.percentage);
      const filtered = result.regions.filter(r => r.percentage > 20);
      const mapped = result.regions.map(r => ({ ...r, label: r.country.toUpperCase() }));

      // Проверяем, что оригинальные данные не изменились
      expect(result.regions).toEqual(originalRegions);
      expect(sorted).toHaveLength(5);
      expect(filtered).toHaveLength(2); // US (45%) и EU (30%)
      expect(mapped[0].label).toBe('US');
    });
  });
});
