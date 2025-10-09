import { describe, it, expect } from 'vitest';
import { LoadDashboardUseCase } from '../../application/use-cases/load-dashboard.use-case';
import { DashboardRepository } from '../../infrastructure/repositories/dashboard.repository';
import { SalesRepository } from '../../infrastructure/repositories/sales.repository';
import { RevenueRepository } from '../../infrastructure/repositories/revenue.repository';
import { GeographyRepository } from '../../infrastructure/repositories/geography.repository';
import { ConversionRepository } from '../../infrastructure/repositories/conversion.repository';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';

describe('LoadDashboardUseCase Integration', () => {
  it('should load dashboard with all panel data', async () => {
    // Arrange
    const httpClient = new HttpClientMock();
    const dashboardRepository = new DashboardRepository();
    const salesRepository = new SalesRepository(httpClient);
    const revenueRepository = new RevenueRepository(httpClient);
    const geographyRepository = new GeographyRepository(httpClient);
    const conversionRepository = new ConversionRepository(httpClient);
    
    const useCase = new LoadDashboardUseCase(
      dashboardRepository,
      salesRepository,
      revenueRepository,
      geographyRepository,
      conversionRepository
    );

    // Act
    const dashboard = await useCase.execute('test-user');

    // Assert
    expect(dashboard).toBeDefined();
    expect(dashboard.salesSummary).toBeDefined();
    expect(dashboard.salesSummary?.totalSales).toBe(125430);
    expect(dashboard.salesSummary?.transactions).toBe(1247);
    expect(dashboard.salesSummary?.arpu).toBe(100.58);
    
    expect(dashboard.revenueSummary).toBeDefined();
    expect(dashboard.revenueSummary?.netIncome).toBe(98250);
    
    expect(dashboard.geographySummary).toBeDefined();
    expect(dashboard.geographySummary?.regions).toHaveLength(4);
    
    expect(dashboard.conversionSummary).toBeDefined();
    expect(dashboard.conversionSummary?.conversionRate).toBe(3.8);
  });

  it('should load dashboard multiple times', async () => {
    // Arrange
    const httpClient = new HttpClientMock();
    const dashboardRepository = new DashboardRepository();
    const salesRepository = new SalesRepository(httpClient);
    const revenueRepository = new RevenueRepository(httpClient);
    const geographyRepository = new GeographyRepository(httpClient);
    const conversionRepository = new ConversionRepository(httpClient);
    
    const useCase = new LoadDashboardUseCase(
      dashboardRepository,
      salesRepository,
      revenueRepository,
      geographyRepository,
      conversionRepository
    );

    // Act - load twice
    const firstDashboard = await useCase.execute('test-user');
    const secondDashboard = await useCase.execute('test-user');

    // Assert - both should have same data
    expect(firstDashboard.salesSummary?.totalSales).toBe(125430);
    expect(secondDashboard.salesSummary?.totalSales).toBe(125430);
  });
});
