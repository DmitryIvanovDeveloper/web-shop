/**
 * Data Flow Test: RevenuePanel
 * Тестирует полный путь данных для 3 метрик (Total Revenue, ARPU, ARPPU)
 * Mock API → HttpClient → Repository → UseCase → Presenter → UI
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Container } from 'inversify';
import { DashboardPresenter } from '../../interface-adapters/presenters/dashboard.presenter';
import { LoadSalesUseCase } from '../../application/use-cases/load-sales.use-case';
import { LoadRevenueUseCase } from '../../application/use-cases/load-revenue.use-case';
import { SalesRepository } from '../../infrastructure/repositories/sales.repository';
import { RevenueRepository } from '../../infrastructure/repositories/revenue.repository';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TrendCalculationService } from '../../infrastructure/services/trend-calculation.service';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../../../infrastructure/http/http-client.mock';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';

describe('Data Flow: RevenuePanel (3 метрики)', () => {
  let container: Container;
  let presenter: DashboardPresenter;
  let httpClient: HttpClientMock;

  beforeEach(() => {
    container = new Container();
    
    httpClient = new HttpClientMock();
    container.bind<HttpClient>(TYPES.HttpClient).toConstantValue(httpClient);
    
    // Bind Services
    container.bind<PeriodComparisonService>(TYPES.PeriodComparisonService)
      .to(PeriodComparisonService)
      .inSingletonScope();
    
    container.bind<TrendCalculationService>(TYPES.TrendCalculationService)
      .to(TrendCalculationService)
      .inSingletonScope();
    
    // Bind Repositories (оба нужны для Presenter)
    container.bind(TYPES.SalesRepository).to(SalesRepository).inSingletonScope();
    container.bind(TYPES.RevenueRepository).to(RevenueRepository).inSingletonScope();
    
    // Bind Use Cases (Presenter зависит от обоих)
    container.bind<LoadSalesUseCase>(TYPES.LoadSalesUseCase)
      .to(LoadSalesUseCase)
      .inSingletonScope();
    
    container.bind<LoadRevenueUseCase>(TYPES.LoadRevenueUseCase)
      .to(LoadRevenueUseCase)
      .inSingletonScope();
    
    // Bind Presenter
    container.bind<DashboardPresenter>(TYPES.DashboardPresenter)
      .to(DashboardPresenter)
      .inSingletonScope();
    
    presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Полный путь для 3 метрик', () => {
    it('Mock API → Presenter: все 3 метрики загружаются корректно', async () => {
      // Act
      await presenter.loadRevenue();

      // Assert: Проверяем все 3 метрики в Presenter state
      const revenueData = presenter.state.revenue?.data;
      
      expect(revenueData?.totalRevenue).toBe(45600);
      expect(revenueData?.arpu).toBe(45.60);
      expect(revenueData?.arppu).toBe(120.50);
      
      // Проверяем comparison
      expect(revenueData?.getGrowthRate()).toBeCloseTo(8.6, 1);
      
      // Проверяем trend
      expect(revenueData?.trend.dataPoints).toHaveLength(8);
      expect(revenueData?.trend.getTrendDirection()).toBe('up');
    });

    it('DTO → Domain Value Object → UI State: типы трансформируются', async () => {
      // Act
      await presenter.loadRevenue();

      // Assert: Domain Value Object создан с методами
      const revenueData = presenter.state.revenue?.data;
      
      expect(typeof revenueData?.getGrowthRate).toBe('function');
      expect(typeof revenueData?.isGrowing).toBe('function');
      expect(typeof revenueData?.hasHealthyMonetization).toBe('function');
      expect(typeof revenueData?.getPayingUserRatio).toBe('function');
      expect(typeof revenueData?.equals).toBe('function');
      
      // Проверяем вложенные Value Objects
      expect(revenueData?.period).toBeDefined();
      expect(revenueData?.trend).toBeDefined();
      expect(revenueData?.comparison).toBeDefined();
    });

    it('Loading states: корректное изменение для всех метрик', async () => {
      // Arrange: Начальное состояние
      expect(presenter.state.revenue?.loading).toBe(false);

      // Act
      const loadPromise = presenter.loadRevenue();
      
      // Assert: Во время загрузки
      expect(presenter.state.revenue?.loading).toBe(true);
      
      await loadPromise;
      
      // Assert: После загрузки
      expect(presenter.state.revenue?.loading).toBe(false);
      expect(presenter.state.revenue?.data).toBeDefined();
    });
  });

  describe('Бизнес-правила через все слои', () => {
    it('Доменные инварианты проверяются: все метрики >= 0', async () => {
      // Act
      await presenter.loadRevenue();

      // Assert
      const revenueData = presenter.state.revenue?.data;
      expect(revenueData?.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(revenueData?.arpu).toBeGreaterThanOrEqual(0);
      expect(revenueData?.arppu).toBeGreaterThanOrEqual(0);
    });

    it('Доменное правило ARPPU >= ARPU валидируется', async () => {
      // Act
      await presenter.loadRevenue();

      // Assert
      const revenueData = presenter.state.revenue?.data;
      expect(revenueData?.arppu).toBeGreaterThanOrEqual(revenueData?.arpu ?? 0);
    });
  });

  describe('Parallel Loading', () => {
    it('loadAllData(): Sales и Revenue загружаются параллельно', async () => {
      // Act
      const startTime = Date.now();
      await presenter.loadAllData();
      const duration = Date.now() - startTime;

      // Assert: Оба запроса выполнены
      expect(presenter.state.sales?.data).toBeDefined();
      expect(presenter.state.revenue?.data).toBeDefined();
      
      // Assert: Параллельная загрузка эффективна
      expect(duration).toBeLessThan(2000);
    });
  });
});
