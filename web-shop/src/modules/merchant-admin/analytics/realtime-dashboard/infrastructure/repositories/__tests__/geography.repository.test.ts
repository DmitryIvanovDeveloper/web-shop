import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeographyRepository } from '../geography.repository';
import { GeographySummary } from '../../../domain/entities/geography-summary.entity';
import type { HttpClient } from '../../../../../application/ports/http-client.port';

// Mock HttpClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
} as unknown as HttpClient;

// Mock FilterApplier
vi.mock('../utils/filter-applier', () => ({
  FilterApplier: {
    loadCurrentFilters: vi.fn().mockResolvedValue({
      dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') }
    }),
    applyDateFilter: vi.fn().mockImplementation((data) => data),
  },
}));

describe('GeographyRepository', () => {
  let geographyRepository: GeographyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    geographyRepository = new GeographyRepository(mockHttpClient);
  });

  describe('Data Flow Tests', () => {
    it('should fetch geography data from API correctly', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'United States', percentage: 45.2 },
            { country: 'Canada', percentage: 23.1 },
            { country: 'United Kingdom', percentage: 15.7 },
            { country: 'Germany', percentage: 10.3 },
            { country: 'France', percentage: 5.7 },
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const result = await geographyRepository.getGeographySummary();

      // Verify API call
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/geography/summary');
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);

      // Verify result structure
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions).toHaveLength(5);
      expect(result.regions[0].country).toBe('United States');
      expect(result.regions[0].percentage).toBe(45.2);
    });

    it('should handle API errors gracefully', async () => {
      const mockErrorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        data: null
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockErrorResponse);

      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Failed to fetch geography data: Internal Server Error');
    });

    it('should load current filters before API call', async () => {
      const { FilterApplier } = await import('../utils/filter-applier');
      
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: { regions: [] }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      await geographyRepository.getGeographySummary();

      // Verify filters are loaded
      expect(FilterApplier.loadCurrentFilters).toHaveBeenCalledTimes(1);
    });

    it('should apply date filters to trend data', async () => {
      const { FilterApplier } = await import('../utils/filter-applier');
      
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'US', percentage: 50 }
          ],
          trend: [
            { timestamp: new Date('2024-01-01'), value: 100 },
            { timestamp: new Date('2024-01-02'), value: 120 },
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      await geographyRepository.getGeographySummary();

      // Verify date filter is applied to trend data
      expect(FilterApplier.applyDateFilter).toHaveBeenCalledWith(
        mockApiResponse.data.trend,
        { start: new Date('2024-01-01'), end: new Date('2024-01-31') }
      );
    });
  });

  describe('Data Processing Tests', () => {
    it('should create GeographySummary entity from API response', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'United States', percentage: 45.2 },
            { country: 'Canada', percentage: 23.1 }
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const result = await geographyRepository.getGeographySummary();

      // Verify entity creation
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions).toEqual([
        { country: 'United States', percentage: 45.2 },
        { country: 'Canada', percentage: 23.1 }
      ]);
    });

    it('should handle empty regions data', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: { regions: [] }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const result = await geographyRepository.getGeographySummary();

      expect(result.regions).toHaveLength(0);
    });

    it('should preserve original data when no trend data exists', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [{ country: 'US', percentage: 100 }]
          // No trend data
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const result = await geographyRepository.getGeographySummary();

      expect(result.regions).toEqual([{ country: 'US', percentage: 100 }]);
    });

    it('should handle malformed API response', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          // Missing regions field
          countries: [
            { name: 'US', percent: 50 }
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      // Should not throw, but create empty regions
      const result = await geographyRepository.getGeographySummary();
      expect(result.regions).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should work with real GeographySummary.fromApiResponse', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'United States', percentage: 45.2 },
            { country: 'Canada', percentage: 23.1 },
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const result = await geographyRepository.getGeographySummary();

      // Verify the entity factory method works correctly
      expect(result).toBeInstanceOf(GeographySummary);
      expect(result.regions[0].country).toBe('United States');
      expect(result.regions[0].percentage).toBe(45.2);
      expect(result.regions[1].country).toBe('Canada');
      expect(result.regions[1].percentage).toBe(23.1);
    });

    it('should maintain data integrity through the entire flow', async () => {
      const originalData = {
        regions: [
          { country: 'United States', percentage: 45.2 },
          { country: 'Canada', percentage: 23.1 },
          { country: 'United Kingdom', percentage: 15.7 },
        ]
      };

      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: originalData
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const result = await geographyRepository.getGeographySummary();

      // Verify data integrity is maintained
      expect(result.regions).toEqual(originalData.regions);
      expect(result.regions[0].country).toBe(originalData.regions[0].country);
      expect(result.regions[0].percentage).toBe(originalData.regions[0].percentage);
    });
  });

  describe('Error Handling Tests', () => {
    it('should throw error for non-200 status codes', async () => {
      const mockErrorResponse = {
        status: 404,
        statusText: 'Not Found',
        data: null
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockErrorResponse);

      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Failed to fetch geography data: Not Found');
    });

    it('should handle network errors', async () => {
      vi.mocked(mockHttpClient.get).mockRejectedValue(new Error('Network error'));

      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      vi.mocked(mockHttpClient.get).mockRejectedValue(new Error('Request timeout'));

      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Request timeout');
    });
  });

  describe('Performance Tests', () => {
    it('should make only one API call per request', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: { regions: [] }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      await geographyRepository.getGeographySummary();

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent requests independently', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: { regions: [{ country: 'US', percentage: 100 }] }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      // Make concurrent requests
      const [result1, result2] = await Promise.all([
        geographyRepository.getGeographySummary(),
        geographyRepository.getGeographySummary(),
      ]);

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      expect(result1).toBeInstanceOf(GeographySummary);
      expect(result2).toBeInstanceOf(GeographySummary);
    });
  });
});
