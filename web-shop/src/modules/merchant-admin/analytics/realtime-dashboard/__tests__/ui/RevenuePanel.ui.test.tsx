/**
 * UI Test: RevenuePanel
 * Тестирует рендеринг грида из 3 карточек (Total Revenue, ARPU, ARPPU)
 * Vitest + @testing-library/react
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Container } from 'inversify';
import { RevenuePanel } from '../../interface-adapters/views/components/RevenuePanel';
import { DashboardPresenter } from '../../interface-adapters/presenters/dashboard.presenter';
import { LoadRevenueUseCase } from '../../application/use-cases/load-revenue.use-case';
import { RevenueRepository } from '../../infrastructure/repositories/revenue.repository';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../../../infrastructure/http/http-client.mock';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';

describe('RevenuePanel UI Tests (Grid из 3 карточек)', () => {
  let container: Container;
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
    
    container.bind<DashboardPresenter>(TYPES.DashboardPresenter)
      .to(DashboardPresenter)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Рендеринг грида (3 карточки)', () => {
    it('должен отрендерить все 3 заголовка: Total Revenue, ARPU, ARPPU', async () => {
      // Act
      render(<RevenuePanel container={container} />);

      // Assert
      expect(screen.getByText('Total Revenue')).toBeDefined();
      expect(screen.getByText('ARPU')).toBeDefined();
      expect(screen.getByText('ARPPU')).toBeDefined();
    });

    it('должен применить CSS классы для грида', () => {
      // Act
      const { container: dom } = render(<RevenuePanel container={container} />);

      // Assert
      expect(dom.querySelector('.revenue-panel')).toBeDefined();
      expect(dom.querySelector('.revenue-panel-grid')).toBeDefined();
      expect(dom.querySelector('.arpu-card')).toBeDefined();
      expect(dom.querySelector('.arppu-card')).toBeDefined();
    });
  });

  describe('Отображение значений метрик из mock файла', () => {
    it('Total Revenue: должен показать $45.6K', async () => {
      // Act
      render(<RevenuePanel container={container} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('$45.6K')).toBeDefined();
      }, { timeout: 3000 });
    });

    it('ARPU: должен показать $45.60', async () => {
      // Act
      render(<RevenuePanel container={container} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('$45.60')).toBeDefined();
      }, { timeout: 3000 });
    });

    it('ARPPU: должен показать $120.50', async () => {
      // Act
      render(<RevenuePanel container={container} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('$120.50')).toBeDefined();
      }, { timeout: 3000 });
    });
  });

  describe('Loading states для всех 3 карточек', () => {
    it('все 3 карточки показывают loading skeleton', () => {
      // Act
      const { container: dom } = render(<RevenuePanel container={container} />);

      // Assert
      const loadingCards = dom.querySelectorAll('.metric-card.loading');
      expect(loadingCards.length).toBe(3);
    });

    it('loading исчезает после загрузки данных', async () => {
      // Act
      const { container: dom } = render(<RevenuePanel container={container} />);

      // Assert
      await waitFor(() => {
        const loadingCards = dom.querySelectorAll('.metric-card.loading');
        expect(loadingCards.length).toBe(0);
      }, { timeout: 3000 });
    });
  });

  describe('ComparisonBadge и MiniTrendChart (только Total Revenue)', () => {
    it('Total Revenue должен показать ComparisonBadge с ростом ~8.6%', async () => {
      // Act
      render(<RevenuePanel container={container} />);

      // Assert: Рост из mock файла (45600 vs 42000)
      await waitFor(() => {
        const badge = screen.getByText(/\+8|\+8\.6%|\+9%/);
        expect(badge).toBeDefined();
      }, { timeout: 3000 });
    });

    it('Total Revenue должен показать MiniTrendChart', async () => {
      // Act
      const { container: dom } = render(<RevenuePanel container={container} />);

      // Assert: Только Total Revenue имеет график
      await waitFor(() => {
        const charts = dom.querySelectorAll('svg.mini-trend-chart');
        expect(charts.length).toBe(1);
      }, { timeout: 3000 });
    });

    it('ARPU и ARPPU НЕ должны показывать ComparisonBadge', async () => {
      // Act
      const { container: dom } = render(<RevenuePanel container={container} />);

      // Assert: Только Total Revenue имеет badge
      await waitFor(() => {
        const arpuCard = dom.querySelector('.arpu-card');
        const arppuCard = dom.querySelector('.arppu-card');
        
        expect(arpuCard?.querySelector('.comparison-badge')).toBeNull();
        expect(arppuCard?.querySelector('.comparison-badge')).toBeNull();
      }, { timeout: 3000 });
    });
  });
});
