import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleGeographyRepository } from '../infrastructure/repositories/geography.repository.simple';
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

describe('Geography Full Flow Test', () => {
  let simpleGeographyRepository: SimpleGeographyRepository;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
    };
    simpleGeographyRepository = new SimpleGeographyRepository(mockHttpClient);
  });

  describe('Complete Data Flow Test', () => {
    it('should load and process real geography data end-to-end', async () => {
      // Настраиваем мок для возврата реальных данных
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      // Шаг 1: Загружаем данные через репозиторий
      const geographySummary = await simpleGeographyRepository.getGeographySummary();

      // Шаг 2: Проверяем, что данные загружены корректно
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[0].percentage).toBe(45.0);

      // Шаг 3: Симулируем подготовку данных для UI (как в GeographyPanel)
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: colors[index % colors.length],
      }));

      // Шаг 4: Проверяем, что данные готовы для отображения
      expect(chartData).toHaveLength(5);
      expect(chartData[0].label).toBe('US');
      expect(chartData[0].value).toBe(45.0);
      expect(chartData[0].color).toBe('#3b82f6');
      expect(chartData[1].label).toBe('EU');
      expect(chartData[1].value).toBe(30.0);
      expect(chartData[1].color).toBe('#8b5cf6');

      // Шаг 5: Проверяем, что API был вызван с правильным URL
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/geography/summary');
    });

    it('should handle empty data gracefully in full flow', async () => {
      // Настраиваем мок для возврата пустых данных
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: { regions: [] }
      });

      // Загружаем данные
      const geographySummary = await simpleGeographyRepository.getGeographySummary();

      // Проверяем, что пустые данные обрабатываются корректно
      expect(geographySummary.regions).toHaveLength(0);

      // Симулируем подготовку данных для UI
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: colors[index % colors.length],
      }));

      // Проверяем, что пустые данные не вызывают ошибок
      expect(chartData).toHaveLength(0);
    });

    it('should handle API errors gracefully in full flow', async () => {
      // Настраиваем мок для возврата ошибки
      mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

      // Загружаем данные (должно вернуть пустые данные)
      const geographySummary = await simpleGeographyRepository.getGeographySummary();

      // Проверяем, что ошибка обрабатывается корректно
      expect(geographySummary.regions).toHaveLength(0);

      // Симулируем подготовку данных для UI
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: colors[index % colors.length],
      }));

      // Проверяем, что пустые данные не вызывают ошибок
      expect(chartData).toHaveLength(0);
    });
  });

  describe('Data Validation in Full Flow', () => {
    it('should validate data quality throughout the flow', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const geographySummary = await simpleGeographyRepository.getGeographySummary();

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

    it('should detect and handle data anomalies', async () => {
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

      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: anomalousData
      });

      const geographySummary = await simpleGeographyRepository.getGeographySummary();

      // Проверяем обнаружение аномалий
      const anomalies = geographySummary.regions.filter(r => r.percentage > 100);
      const totalPercentage = geographySummary.regions.reduce((sum, r) => sum + r.percentage, 0);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].country).toBe('Anomaly');
      expect(totalPercentage).toBeGreaterThan(100);
    });
  });

  describe('Performance in Full Flow', () => {
    it('should handle data processing efficiently', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const startTime = Date.now();

      // Загружаем данные
      const geographySummary = await simpleGeographyRepository.getGeographySummary();

      // Подготавливаем данные для UI
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      const chartData = geographySummary.regions.map((region, index) => ({
        label: region.country,
        value: region.percentage,
        color: colors[index % colors.length],
      }));

      // Применяем бизнес-логику
      const topRegions = geographySummary.regions
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      const endTime = Date.now();

      // Проверяем производительность
      expect(endTime - startTime).toBeLessThan(50); // Должно быть быстро
      expect(chartData).toHaveLength(5);
      expect(topRegions[0].country).toBe('US');
      expect(topRegions[1].country).toBe('EU');
      expect(topRegions[2].country).toBe('Asia');
    });
  });
});
