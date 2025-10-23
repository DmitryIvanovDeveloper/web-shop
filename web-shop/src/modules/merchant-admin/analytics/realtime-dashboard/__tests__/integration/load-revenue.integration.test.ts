/**
 * Integration Test: LoadRevenueUseCase
 * Тестирует полную интеграцию UseCase + Repository + Services
 * Особенность: многометричный UseCase (Revenue, ARPU, ARPPU)
 * Использует реальные mock файлы из public/mocks/api/
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Container } from 'inversify';
import { LoadRevenueUseCase } from '../../application/use-cases/load-revenue.use-case';
import { RevenueRepository } from '../../infrastructure/repositories/revenue.repository';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { Period, DashboardFilters } from '../../domain';
import { HttpClientMock } from '../../../../../../infrastructure/http/http-client.mock';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';

describe('LoadRevenueUseCase Integration Tests', () => {
  let container: Container;
  let useCase: LoadRevenueUseCase;
  let httpClient: HttpClientMock;

  beforeEach(() => {
    container = new Container();
    
    httpClient = new HttpClientMock();
    container.bind<HttpClient>(TYPES.HttpClient).toConstantValue(httpClient);
    
    container.bind<PeriodComparisonService>(TYPES.PeriodComparisonService)
      .to(PeriodComparisonService)
      .inSingletonScope();
    
    container.bind(TYPES.RevenueRepository).to(RevenueRepository).inSingletonScope();
    
    container.bind<LoadRevenueUseCase>(TYPES.LoadRevenueUseCase)
      .to(LoadRevenueUseCase)
      .inSingletonScope();
    
    useCase = container.get<LoadRevenueUseCase>(TYPES.LoadRevenueUseCase);
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Многометричная загрузка из mock файла', () => {
    it('должен загрузить все 3 метрики из public/mocks/api/revenue/summary.json', async () => {
      // Arrange: Фиксированный период как в mock файле
      const periodResult = Period.create(new Date('2025-10-06'), new Date('2025-10-13'), 'day');
      const period = periodResult.data!;
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBeDefined();
      
      // Проверяем все 3 метрики из файла
      expect(result.data?.totalRevenue).toBe(45600);
      expect(result.data?.arpu).toBe(45.60);
      expect(result.data?.arppu).toBe(120.50);
      
      // Проверяем comparison
      expect(result.data?.getGrowthRate()).toBeCloseTo(8.6, 1); // (45600-42000)/42000 * 100
      expect(result.data?.isGrowing()).toBe(true);
    });

    it('должен загрузить 8 точек тренда из mock файла', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.trend.dataPoints).toHaveLength(8);
    });
  });

  describe('Domain бизнес-правила', () => {
    it('должен проверить доменное правило: ARPPU >= ARPU', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: В mock файле ARPPU (120.50) > ARPU (45.60)
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.arppu).toBeGreaterThanOrEqual(result.data?.arpu ?? 0);
    });

    it('должен проверить здоровье монетизации (ARPPU >= 2×ARPU)', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: В mock файле ARPPU=120.50, ARPU=45.60 => 120.50 >= 2*45.60 (91.20)
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.hasHealthyMonetization()).toBe(true);
    });

    it('должен рассчитать conversion rate платящих пользователей', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: ARPU/ARPPU = 45.60/120.50 ≈ 37.8%
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.getPayingUserRatio()).toBeCloseTo(37.8, 1);
    });

    it('RevenueSummary должен быть Value Object с бизнес-методами', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: Проверяем наличие доменных методов
      expect(result.isSuccess()).toBe(true);
      expect(typeof result.data?.getGrowthRate).toBe('function');
      expect(typeof result.data?.isGrowing).toBe('function');
      expect(typeof result.data?.isCriticalChange).toBe('function');
      expect(typeof result.data?.hasHealthyMonetization).toBe('function');
      expect(typeof result.data?.getPayingUserRatio).toBe('function');
      expect(typeof result.data?.equals).toBe('function');
    });
  });

  describe('Services Integration', () => {
    it('PeriodComparisonService: должен работать в связке с UseCase', () => {
      // Arrange
      const periodComparisonService = container.get<PeriodComparisonService>(TYPES.PeriodComparisonService);
      const periodResult = Period.create(new Date('2025-10-06'), new Date('2025-10-13'), 'day');
      const period = periodResult.data!;

      // Act
      const previousPeriod = periodComparisonService.calculatePreviousPeriod(period);

      // Assert
      expect(previousPeriod.getDurationInDays()).toBe(7);
      expect(previousPeriod.endDate.getTime()).toBeLessThanOrEqual(period.startDate.getTime());
      expect(previousPeriod.startDate.toISOString()).toContain('2025-09-29');
    });

    it('Repository + UseCase: полная интеграция через DI', async () => {
      // Arrange
      const period = Period.fromPreset('last7days');
      const filters = DashboardFilters.create(period);

      // Act
      const result = await useCase.execute(period, filters);

      // Assert: Все зависимости работают
      expect(result.isSuccess()).toBe(true);
      expect(result.data?.period).toBeDefined();
      expect(result.data?.comparison).toBeDefined();
      expect(result.data?.trend).toBeDefined();
    });
  });
});
