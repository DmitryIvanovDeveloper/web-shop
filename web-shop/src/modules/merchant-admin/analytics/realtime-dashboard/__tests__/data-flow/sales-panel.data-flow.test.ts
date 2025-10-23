/**
 * Data Flow Test: SalesPanel
 * Тестирует полный путь данных: Mock API → HttpClient → Repository → UseCase → Presenter → UI
 * Использует реальные mock файлы
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

describe('Data Flow: SalesPanel (Mock API → UI)', () => {
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
    
    // Bind Repositories (нужны для обоих Use Cases)
    container.bind(TYPES.SalesRepository).to(SalesRepository).inSingletonScope();
    container.bind(TYPES.RevenueRepository).to(RevenueRepository).inSingletonScope();
    
    // Bind Use Cases (Presenter зависит от обоих)
    container.bind<LoadSalesUseCase>(TYPES.LoadSalesUseCase)
      .to(LoadSalesUseCase)
      .inSingletonScope();
    
    container.bind(TYPES.LoadRevenueUseCase)
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

  describe('Полный путь данных (Mock → Presenter)', () => {
    it('Mock API → Repository → UseCase → Presenter: данные загружаются в state', async () => {
      // Act: Presenter вызывает loadSales()
      await presenter.loadSales();

      // Assert: Данные прошли все слои и попали в Presenter state
      expect(presenter.state.sales?.loading).toBe(false);
      expect(presenter.state.sales?.error).toBeUndefined();
      expect(presenter.state.sales?.data).toBeDefined();
      
      // Проверяем данные из mock файла
      expect(presenter.state.sales?.data?.totalSales).toBe(1234);
      expect(presenter.state.sales?.data?.getGrowthRate()).toBeCloseTo(14.8, 1);
      expect(presenter.state.sales?.data?.isGrowing()).toBe(true);
      expect(presenter.state.sales?.data?.trend.dataPoints).toHaveLength(8);
    });

    it('Loading state корректно меняется: true → false', async () => {
      // Arrange: Начальное состояние
      expect(presenter.state.sales?.loading).toBe(false);

      // Act: Начинаем загрузку
      const loadPromise = presenter.loadSales();
      
      // Assert: Во время загрузки
      expect(presenter.state.sales?.loading).toBe(true);
      
      await loadPromise;
      
      // Assert: После загрузки
      expect(presenter.state.sales?.loading).toBe(false);
    });
  });

  describe('Трансформация данных через слои', () => {
    it('DTO → Domain Value Object → Presenter State', async () => {
      // Act
      await presenter.loadSales();

      // Assert: Domain Entity создан с Value Objects
      const salesData = presenter.state.sales?.data;
      expect(salesData).toBeDefined();
      
      // Проверяем что это Domain Value Object, а не просто DTO
      expect(salesData?.period).toBeDefined();
      expect(salesData?.trend).toBeDefined();
      expect(salesData?.comparison).toBeDefined();
      
      // Проверяем вложенные Value Objects
      expect(typeof salesData?.period.isEqual).toBe('function');
      expect(typeof salesData?.trend.getTrendStrength).toBe('function');
      expect(typeof salesData?.comparison.isPositive).toBe('function');
    });

    it('Query params формируются корректно через слои', async () => {
      // Act: Вызываем с дефолтными фильтрами
      await presenter.loadSales();

      // Assert: Repository получил period в правильном формате
      expect(presenter.state.sales?.data?.period.granularity).toBe('day');
    });
  });

  describe('Бизнес-сценарии E2E', () => {
    it('Сценарий: Данные из mock файла проходят валидацию и расчёты', async () => {
      // Act
      await presenter.loadSales();

      // Assert: Проверяем что бизнес-правила применены
      const salesData = presenter.state.sales?.data;
      
      // Проверяем рост (из mock: 1234 vs 1075)
      expect(salesData?.isGrowing()).toBe(true);
      expect(salesData?.isCriticalChange()).toBe(false); // <20%
      
      // Проверяем тренд расчёт
      expect(salesData?.trend.getTrendStrength()).toBeDefined();
    });
  });
});
