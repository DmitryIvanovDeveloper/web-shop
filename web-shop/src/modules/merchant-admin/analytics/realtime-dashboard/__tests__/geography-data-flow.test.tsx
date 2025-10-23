import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { GeographyRepository } from '../infrastructure/repositories/geography.repository';
import { GeographyPanel } from '../interface-adapters/ui/GeographyPanel';
import { GeographySummary } from '../domain/entities/geography-summary.entity';
import type { HttpClient } from '../../../application/ports/http-client.port';

// Mock HttpClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
} as unknown as HttpClient;

// Mock DonutChart component
vi.mock('../../../../shared/ui/charts/DonutChart', () => ({
  DonutChart: ({ data }: { data: any[] }) => {
    return React.createElement('div', {
      'data-testid': 'donut-chart',
      'data-chart-data': JSON.stringify(data)
    }, `Mock DonutChart with ${data.length} regions`);
  },
}));

// Mock FilterApplier
vi.mock('../infrastructure/repositories/utils/filter-applier', () => ({
  FilterApplier: {
    loadCurrentFilters: vi.fn().mockResolvedValue({
      dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') }
    }),
    applyDateFilter: vi.fn().mockImplementation((data) => data),
  },
}));

describe('Geography Data Flow Integration Tests', () => {
  let geographyRepository: GeographyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    geographyRepository = new GeographyRepository(mockHttpClient);
  });

  describe('Complete Data Flow: API → Repository → Entity → UI', () => {
    it('should flow data correctly from API response to UI display', async () => {
      // Mock API response
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

      // Step 1: Fetch data from repository
      const geographySummary = await geographyRepository.getGeographySummary();

      // Step 2: Verify repository layer
      expect(geographySummary).toBeInstanceOf(GeographySummary);
      expect(geographySummary.regions).toHaveLength(5);
      expect(geographySummary.regions[0].country).toBe('United States');
      expect(geographySummary.regions[0].percentage).toBe(45.2);

      // Step 3: Render UI component
      render(<GeographyPanel geographySummary={geographySummary} />);

      // Step 4: Verify UI layer
      expect(screen.getByText('Geography Panel')).toBeInTheDocument();
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();

      // Step 5: Verify data transformation in UI
      const donutChart = screen.getByTestId('donut-chart');
      const chartData = JSON.parse(donutChart.getAttribute('data-chart-data') || '[]');

      expect(chartData).toHaveLength(5);
      expect(chartData[0]).toEqual({
        label: 'United States',
        value: 45.2,
        color: '#3b82f6'
      });
      expect(chartData[1]).toEqual({
        label: 'Canada',
        value: 23.1,
        color: '#8b5cf6'
      });
    });

    it('should handle real-time data updates flow', async () => {
      // Initial data
      const initialApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'United States', percentage: 40.0 },
            { country: 'Canada', percentage: 25.0 },
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(initialApiResponse);

      // Fetch initial data
      let geographySummary = await geographyRepository.getGeographySummary();
      render(<GeographyPanel geographySummary={geographySummary} />);

      // Verify initial state
      let donutChart = screen.getByTestId('donut-chart');
      let chartData = JSON.parse(donutChart.getAttribute('data-chart-data') || '[]');
      expect(chartData[0].value).toBe(40.0);

      // Simulate real-time update
      const updatedApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'United States', percentage: 45.0 },
            { country: 'Canada', percentage: 30.0 },
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(updatedApiResponse);

      // Fetch updated data
      geographySummary = await geographyRepository.getGeographySummary();
      
      // Re-render with updated data
      render(<GeographyPanel geographySummary={geographySummary} />);

      // Verify updated state
      donutChart = screen.getByTestId('donut-chart');
      chartData = JSON.parse(donutChart.getAttribute('data-chart-data') || '[]');
      expect(chartData[0].value).toBe(45.0);
      expect(chartData[1].value).toBe(30.0);
    });

    it('should handle error states in the data flow', async () => {
      // Mock API error
      const mockErrorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        data: null
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockErrorResponse);

      // Repository should throw error
      await expect(geographyRepository.getGeographySummary())
        .rejects
        .toThrow('Failed to fetch geography data: Internal Server Error');
    });
  });

  describe('Data Validation Flow', () => {
    it('should validate data at each layer', async () => {
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

      // Test repository layer validation
      const geographySummary = await geographyRepository.getGeographySummary();
      expect(geographySummary.regions).toBeDefined();
      expect(Array.isArray(geographySummary.regions)).toBe(true);

      // Test entity layer validation
      expect(geographySummary.regions[0].country).toBeDefined();
      expect(typeof geographySummary.regions[0].percentage).toBe('number');

      // Test UI layer validation
      render(<GeographyPanel geographySummary={geographySummary} />);
      const donutChart = screen.getByTestId('donut-chart');
      expect(donutChart).toBeInTheDocument();
    });

    it('should handle malformed data gracefully', async () => {
      const mockMalformedResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'United States', percentage: 'invalid' }, // Invalid percentage
            { country: '', percentage: 25.0 }, // Empty country name
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockMalformedResponse);

      const geographySummary = await geographyRepository.getGeographySummary();
      render(<GeographyPanel geographySummary={geographySummary} />);

      // UI should still render, even with malformed data
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
    });
  });

  describe('Performance Flow Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // Generate large dataset
      const largeRegions = Array.from({ length: 100 }, (_, i) => ({
        country: `Country ${i}`,
        percentage: Math.random() * 100
      }));

      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: { regions: largeRegions }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      const startTime = Date.now();
      
      const geographySummary = await geographyRepository.getGeographySummary();
      render(<GeographyPanel geographySummary={geographySummary} />);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process large dataset quickly (< 100ms)
      expect(processingTime).toBeLessThan(100);
      expect(geographySummary.regions).toHaveLength(100);
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
    });

    it('should handle concurrent data requests', async () => {
      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          regions: [
            { country: 'US', percentage: 50 },
            { country: 'CA', percentage: 30 },
            { country: 'UK', percentage: 20 },
          ]
        }
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      // Make multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        geographyRepository.getGeographySummary()
      );

      const results = await Promise.all(promises);

      // All should succeed and return same data
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeInstanceOf(GeographySummary);
        expect(result.regions).toHaveLength(3);
      });
    });
  });

  describe('End-to-End Data Consistency', () => {
    it('should maintain data consistency from API to UI', async () => {
      const originalData = {
        regions: [
          { country: 'United States', percentage: 45.2 },
          { country: 'Canada', percentage: 23.1 },
          { country: 'United Kingdom', percentage: 15.7 },
          { country: 'Germany', percentage: 10.3 },
          { country: 'France', percentage: 5.7 },
        ]
      };

      const mockApiResponse = {
        status: 200,
        statusText: 'OK',
        data: originalData
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse);

      // Complete flow
      const geographySummary = await geographyRepository.getGeographySummary();
      render(<GeographyPanel geographySummary={geographySummary} />);

      // Verify data consistency
      const donutChart = screen.getByTestId('donut-chart');
      const chartData = JSON.parse(donutChart.getAttribute('data-chart-data') || '[]');

      // Check all original data is preserved
      originalData.regions.forEach((originalRegion, index) => {
        expect(chartData[index].label).toBe(originalRegion.country);
        expect(chartData[index].value).toBe(originalRegion.percentage);
      });

      // Check no data is lost or added
      expect(chartData).toHaveLength(originalData.regions.length);
    });
  });
});
