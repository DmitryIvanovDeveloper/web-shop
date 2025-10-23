import { describe, it, expect } from 'vitest';
import { SupabaseRevenueRepository } from '../../infrastructure/repositories/supabase-revenue.repository';
import { ConsoleLogger } from '../../../../../../../infrastructure/logging/console-logger';

describe('SupabaseRevenueRepository Integration', () => {
  it('should load revenue summary with real Supabase connection', async () => {
    // Arrange
    const logger = new ConsoleLogger();
    const repository = new SupabaseRevenueRepository(logger);

    // Act
    const revenueSummary = await repository.getRevenueSummary();

    // Assert
    expect(revenueSummary).toBeDefined();
    expect(revenueSummary.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(revenueSummary.averageOrderValue).toBeGreaterThanOrEqual(0);
    expect(revenueSummary.revenuePerVisitor).toBeGreaterThanOrEqual(0);
    expect(revenueSummary.netIncome).toBeGreaterThanOrEqual(0);
    expect(revenueSummary.currency).toBe('USD');
    expect(revenueSummary.trend).toBeDefined();
    expect(Array.isArray(revenueSummary.trend)).toBe(true);
    
    // Verify trend data structure
    revenueSummary.trend.forEach(point => {
      expect(point).toHaveProperty('timestamp');
      expect(point).toHaveProperty('value');
      expect(point.timestamp).toBeInstanceOf(Date);
      expect(typeof point.value).toBe('number');
    });
  });

  it('should handle multiple consecutive calls', async () => {
    // Arrange
    const logger = new ConsoleLogger();
    const repository = new SupabaseRevenueRepository(logger);

    // Act - Make multiple calls
    const firstCall = await repository.getRevenueSummary();
    const secondCall = await repository.getRevenueSummary();

    // Assert - Both calls should return valid data
    expect(firstCall).toBeDefined();
    expect(secondCall).toBeDefined();
    expect(firstCall.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(secondCall.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  it('should calculate metrics consistently', async () => {
    // Arrange
    const logger = new ConsoleLogger();
    const repository = new SupabaseRevenueRepository(logger);

    // Act
    const revenueSummary = await repository.getRevenueSummary();

    // Assert - Verify mathematical relationships
    if (revenueSummary.totalRevenue > 0) {
      expect(revenueSummary.averageOrderValue).toBeGreaterThan(0);
      expect(revenueSummary.netIncome).toBeLessThanOrEqual(revenueSummary.totalRevenue);
    }
    
    // Monthly growth should be a percentage
    expect(typeof revenueSummary.monthlyGrowth).toBe('number');
  });
});
