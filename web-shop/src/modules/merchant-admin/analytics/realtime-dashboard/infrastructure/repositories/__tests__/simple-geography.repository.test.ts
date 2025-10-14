import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleGeographyRepository } from '../geography.repository.simple';
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

describe('SimpleGeographyRepository', () => {
  let simpleGeographyRepository: SimpleGeographyRepository;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
    };
    simpleGeographyRepository = new SimpleGeographyRepository(mockHttpClient);
  });

  describe('Data Loading Tests', () => {
    it('should load geography data successfully', async () => {
      // Настраиваем мок для возврата реальных данных
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await simpleGeographyRepository.getGeographySummary();

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

    it('should handle API errors gracefully', async () => {
      // Настраиваем мок для возврата ошибки
      mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await simpleGeographyRepository.getGeographySummary();

      // Проверяем, что возвращаются пустые данные в случае ошибки
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions).toHaveLength(0);
    });

    it('should handle HTTP error responses', async () => {
      // Настраиваем мок для возврата HTTP ошибки
      mockHttpClient.get.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error',
        data: null
      });

      const result = await simpleGeographyRepository.getGeographySummary();

      // Проверяем, что возвращаются пустые данные в случае HTTP ошибки
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions).toHaveLength(0);
    });

    it('should preserve data integrity from real JSON', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: geographyData
      });

      const result = await simpleGeographyRepository.getGeographySummary();

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

    it('should handle empty regions data', async () => {
      const emptyData = { regions: [] };
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: emptyData
      });

      const result = await simpleGeographyRepository.getGeographySummary();

      expect(result.regions).toHaveLength(0);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network errors', async () => {
      mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await simpleGeographyRepository.getGeographySummary();

      expect(result.regions).toHaveLength(0);
    });

    it('should handle malformed response data', async () => {
      const malformedData = {
        countries: [] // Wrong property name
      };
      
      mockHttpClient.get.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: malformedData
      });

      const result = await simpleGeographyRepository.getGeographySummary();
      
      // GeographySummary.fromApiResponse не валидирует, поэтому regions будет undefined
      expect(result.regions).toBeUndefined();
    });
  });
});
