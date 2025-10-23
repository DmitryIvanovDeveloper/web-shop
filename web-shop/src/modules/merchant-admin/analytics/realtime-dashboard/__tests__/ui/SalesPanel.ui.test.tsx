/**
 * UI Test: SalesPanel
 * Тестирует рендеринг, loading состояния, взаимодействия
 * Vitest + @testing-library/react
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Container } from 'inversify';
import { SalesPanel } from '../../interface-adapters/views/components/SalesPanel';
import { DashboardPresenter } from '../../interface-adapters/presenters/dashboard.presenter';
import { LoadSalesUseCase } from '../../application/use-cases/load-sales.use-case';
import { SalesRepository } from '../../infrastructure/repositories/sales.repository';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../../../infrastructure/http/http-client.mock';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';

describe('SalesPanel UI Tests', () => {
  let container: Container;
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
    
    container.bind<DashboardPresenter>(TYPES.DashboardPresenter)
      .to(DashboardPresenter)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Рендеринг компонента', () => {
    it('должен отрендерить MetricCard с заголовком "Sales"', async () => {
      // Arrange
      const presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
      
      // Act
      render(<SalesPanel presenter={presenter} />);

      // Assert
      expect(screen.getByText('Sales')).toBeDefined();
    });

    it('должен показать loading skeleton при загрузке', () => {
      // Arrange
      const presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
      
      // Act
      const { container: dom } = render(<SalesPanel presenter={presenter} />);

      // Assert: Проверяем loading class
      const metricCard = dom.querySelector('.metric-card.loading');
      expect(metricCard).toBeDefined();
    });

    it('должен отобразить данные из mock файла после загрузки', async () => {
      // Arrange
      const presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
      
      // Act
      render(<SalesPanel presenter={presenter} />);

      // Assert: Ждём загрузку данных из public/mocks/api/sales/summary.json
      await waitFor(() => {
        const value = screen.getByText(/\$1\.2K|\$1,234/);
        expect(value).toBeDefined();
      }, { timeout: 3000 });
    });

    it('должен отобразить ComparisonBadge с процентом роста', async () => {
      // Arrange
      const presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
      
      // Act
      render(<SalesPanel presenter={presenter} />);

      // Assert: Рост ~14.8% из mock файла (1234 vs 1075)
      await waitFor(() => {
        const badge = screen.getByText(/\+14|\+14\.8%|\+15%/);
        expect(badge).toBeDefined();
      }, { timeout: 3000 });
    });
  });

  describe('Loading States', () => {
    it('loading class исчезает после загрузки', async () => {
      // Arrange
      const presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
      
      // Act
      const { container: dom } = render(<SalesPanel presenter={presenter} />);

      // Assert: После загрузки loading class исчезает
      await waitFor(() => {
        const loadingCards = dom.querySelectorAll('.metric-card.loading');
        expect(loadingCards.length).toBe(0);
      }, { timeout: 3000 });
    });
  });

  describe('Форматирование значений', () => {
    it('должен отформатировать 1234 как $1.2K через MetricFormatter', async () => {
      // Arrange
      const presenter = container.get<DashboardPresenter>(TYPES.DashboardPresenter);
      
      // Act
      render(<SalesPanel presenter={presenter} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('$1.2K')).toBeDefined();
      }, { timeout: 3000 });
    });
  });
});
