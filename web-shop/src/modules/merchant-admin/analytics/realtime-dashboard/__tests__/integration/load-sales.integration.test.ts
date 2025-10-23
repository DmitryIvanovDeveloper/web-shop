/**
 * Integration Test: LoadSalesUseCase
 * Тестирует полную интеграцию UseCase + Repository + Services
 * Использует реальные mock файлы из public/mocks/api/
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Container } from 'inversify';
import { LoadSalesUseCase } from '../../application/use-cases/load-sales.use-case';
import { SalesRepository } from '../../infrastructure/repositories/sales.repository';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { Period, DashboardFilters } from '../../domain';
import { HttpClientMock } from '../../../../../../infrastructure/http/http-client.mock';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';

describe('LoadSalesUseCase Integration Tests', () => {
  let container: Container;
  let useCase: LoadSalesUseCase;
  let httpClient: HttpClientMock;

  beforeEach(() => {
    container = new Container();
    
    httpClient = new HttpClientMock();
    container.bind<HttpClient>(TYPES.HttpClient).toConstantValue(httpClient);
    
    container.bind<PeriodComparisonService>(TYPES.PeriodComparisonService)
      .to(PeriodComparisonService)
      .inSingletonScope();
    
    container.bind(TYPES.SalesRepository).to(SalesRepository).inSingletonScope();
    
    container.bind<LoadSalesUseCase>(TYPES.LoadSalesUseCase)
      .to(LoadSalesUseCase)
      .inSingletonScope();
    
    useCase = container.get<LoadSalesUseCase>(TYPES.LoadSalesUseCase);
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Успешная загрузка данных из mock файла', () => {
    it('должен загрузить SalesSummary из public/mocks/api/sales/summary.json', async () => {
      // Arrange: Используем фиксированный период как в mock файле
      const periodResult = Period.create(
        new Date('2025-10-06'),
        new Date('2025-10-13'),
        'day'
      );
      const period = periodResult.data!;
      const filters = DashboardFilters.create(period);

      // Act: HttpClientMock читает из файла
      const result = await useCase.execute(period, filters);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBeDefined();
      
      // Проверяем данные соответствуют файлу
      expect(result.data?.totalSales).toBe(1234);
      expect(result.data?.getGrowthRate()).toBeCloseTo(14.8, 1); // (1234-1075)/1075 * 100
      expect(result.data?.isGrowing()).toBe(true);
      expect(result.data?.isCriticalChange()).toBe(false); // 14.8% < 20%
    });

    it('должен загрузить все 8 точек тренда из mock файла', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.trend.dataPoints).toHaveLength(8);
      expect(result.data?.trend.dataPoints[0].date).toBe('2025-10-06');
      expect(result.data?.trend.dataPoints[0].value).toBe(150);
    });
  });

  describe('Domain Value Object методы', () => {
    it('SalesSummary должен иметь бизнес-методы', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: Проверяем что это Value Object с методами
      expect(result.isSuccess()).toBe(true);
      expect(typeof result.data?.getGrowthRate).toBe('function');
      expect(typeof result.data?.isGrowing).toBe('function');
      expect(typeof result.data?.isCriticalChange).toBe('function');
      expect(typeof result.data?.equals).toBe('function');
    });

    it('должен проверить инварианты: totalSales >= 0', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.totalSales).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Services Integration', () => {
    it('PeriodComparisonService: должен рассчитать предыдущий период', () => {
      // Arrange
      const periodComparisonService = container.get<PeriodComparisonService>(TYPES.PeriodComparisonService);
      const periodResult = Period.create(new Date('2025-10-06'), new Date('2025-10-13'), 'day');
      const period = periodResult.data!;

      // Act
      const previousPeriod = periodComparisonService.calculatePreviousPeriod(period);

      // Assert: Предыдущий период должен быть раньше на 7 дней
      expect(previousPeriod.getDurationInDays()).toBe(7);
      expect(previousPeriod.endDate.getTime()).toBeLessThanOrEqual(period.startDate.getTime());
      expect(previousPeriod.startDate.toISOString()).toContain('2025-09-29');
    });

    it('Repository + UseCase: должны работать через DI контейнер', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: Все зависимости внедрены корректно
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.period).toBeDefined();
      expect(result.data?.comparison).toBeDefined();
      expect(result.data?.trend).toBeDefined();
    });
  });
});
