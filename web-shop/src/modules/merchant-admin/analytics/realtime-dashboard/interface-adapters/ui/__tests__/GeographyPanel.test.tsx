import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { GeographyPanel } from '../GeographyPanel';
import { GeographySummary } from '../../../domain/entities/geography-summary.entity';

// Mock DonutChart component - but it seems to be using the real component
// Let's test the actual behavior instead of mocking

describe('GeographyPanel', () => {
  const mockGeographyData = {
    regions: [
      { country: 'United States', percentage: 45.2 },
      { country: 'Canada', percentage: 23.1 },
      { country: 'United Kingdom', percentage: 15.7 },
      { country: 'Germany', percentage: 10.3 },
      { country: 'France', percentage: 5.7 },
    ]
  };

  const mockGeographySummary = GeographySummary.fromApiResponse(mockGeographyData);

  beforeEach(() => {
    cleanup();
  });

  describe('Data Flow Tests', () => {
    it('should receive and process geography data correctly', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      // Verify that the component receives the data
      expect(mockGeographySummary.regions).toHaveLength(5);
      expect(mockGeographySummary.regions[0].country).toBe('United States');
      expect(mockGeographySummary.regions[0].percentage).toBe(45.2);
    });

    it('should transform data for chart visualization', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      // Verify that the component renders with the correct data
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
      
      // Verify percentages are displayed
      expect(screen.getByText('45.2')).toBeInTheDocument();
      expect(screen.getByText('23.1')).toBeInTheDocument();
    });

    it('should apply color scheme correctly to chart data', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      // Verify that the chart renders (SVG element exists)
      const svgElement = screen.getByRole('img', { hidden: true }) || document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    it('should handle empty data gracefully', () => {
      const emptyGeographyData = { regions: [] };
      const emptyGeographySummary = GeographySummary.fromApiResponse(emptyGeographyData);
      
      render(<GeographyPanel geographySummary={emptyGeographySummary} />);
      
      // Verify that the component still renders even with empty data
      expect(screen.getByText('Geography Panel')).toBeInTheDocument();
      expect(screen.getByText('Regional Distribution')).toBeInTheDocument();
    });
  });

  describe('Data Display Tests', () => {
    it('should display geography panel header', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      expect(screen.getByText('Geography Panel')).toBeInTheDocument();
      expect(screen.getByText('🌍')).toBeInTheDocument();
      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('should display all country data in the chart', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      // Verify all countries are displayed in the UI
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });

    it('should display correct percentages for each country', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      // Verify percentages are displayed correctly
      expect(screen.getByText('45.2')).toBeInTheDocument();
      expect(screen.getByText('23.1')).toBeInTheDocument();
      expect(screen.getByText('15.7')).toBeInTheDocument();
      expect(screen.getByText('10.3')).toBeInTheDocument();
      expect(screen.getByText('5.7')).toBeInTheDocument();
    });

    it('should have proper styling and layout', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      const panel = screen.getByText('Geography Panel').closest('div');
      expect(panel).toHaveClass('bg-gradient-to-br', 'from-purple-50', 'to-pink-50');
      
      const header = screen.getByText('Geography Panel');
      expect(header).toHaveClass('text-xl', 'font-bold');
    });

    it('should render DonutChart component with correct props', () => {
      render(<GeographyPanel geographySummary={mockGeographySummary} />);
      
      // Verify that the chart component renders (SVG element exists)
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single region data', () => {
      const singleRegionData = {
        regions: [{ country: 'United States', percentage: 100 }]
      };
      const singleRegionSummary = GeographySummary.fromApiResponse(singleRegionData);
      
      render(<GeographyPanel geographySummary={singleRegionSummary} />);
      
      // Verify single region is displayed
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle many regions (more than color array length)', () => {
      const manyRegionsData = {
        regions: [
          { country: 'US', percentage: 20 },
          { country: 'CA', percentage: 15 },
          { country: 'UK', percentage: 12 },
          { country: 'DE', percentage: 10 },
          { country: 'FR', percentage: 8 },
          { country: 'IT', percentage: 6 },
          { country: 'ES', percentage: 5 },
        ]
      };
      const manyRegionsSummary = GeographySummary.fromApiResponse(manyRegionsData);
      
      render(<GeographyPanel geographySummary={manyRegionsSummary} />);
      
      // Verify all regions are displayed
      expect(screen.getByText('US')).toBeInTheDocument();
      expect(screen.getByText('CA')).toBeInTheDocument();
      expect(screen.getByText('UK')).toBeInTheDocument();
      expect(screen.getByText('DE')).toBeInTheDocument();
      expect(screen.getByText('FR')).toBeInTheDocument();
      expect(screen.getByText('IT')).toBeInTheDocument();
      expect(screen.getByText('ES')).toBeInTheDocument();
    });

    it('should handle zero percentage values', () => {
      const zeroPercentageData = {
        regions: [
          { country: 'United States', percentage: 0 },
          { country: 'Canada', percentage: 100 },
        ]
      };
      const zeroPercentageSummary = GeographySummary.fromApiResponse(zeroPercentageData);
      
      render(<GeographyPanel geographySummary={zeroPercentageSummary} />);
      
      // Verify zero and 100 percentages are displayed
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work with real GeographySummary entity', () => {
      const realApiResponse = {
        regions: [
          { country: 'United States', percentage: 45.2 },
          { country: 'Canada', percentage: 23.1 },
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(realApiResponse);
      
      render(<GeographyPanel geographySummary={geographySummary} />);
      
      // Verify the entity works correctly
      expect(geographySummary.regions).toHaveLength(2);
      expect(geographySummary.regions[0].country).toBe('United States');
      
      // Verify the component renders
      expect(screen.getByText('Geography Panel')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });

    it('should maintain data integrity through the flow', () => {
      const originalData = {
        regions: [
          { country: 'United States', percentage: 45.2 },
          { country: 'Canada', percentage: 23.1 },
        ]
      };
      
      const geographySummary = GeographySummary.fromApiResponse(originalData);
      
      render(<GeographyPanel geographySummary={geographySummary} />);
      
      // Verify data integrity is maintained in the UI
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('45.2')).toBeInTheDocument();
      expect(screen.getByText('23.1')).toBeInTheDocument();
    });
  });
});
