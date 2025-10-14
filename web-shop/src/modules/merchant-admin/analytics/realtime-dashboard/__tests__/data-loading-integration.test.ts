import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { TYPES } from '../infrastructure/bootstrap/realtime-dashboard.types';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import { GeographyRepository } from '../infrastructure/repositories/geography.repository';
import { TransactionsRepository } from '../infrastructure/repositories/transactions.repository';
import { LoadDashboardUseCase } from '../application/use-cases/load-dashboard.use-case';
import { DashboardPresenter } from '../interface-adapters/presenters/dashboard.presenter';

// Реальные JSON данные
const mockData = {
  geography: {
    "regions": [
      { "country": "US", "percentage": 45.0 },
      { "country": "EU", "percentage": 30.0 },
      { "country": "Asia", "percentage": 15.0 },
      { "country": "LATAM", "percentage": 7.0 },
      { "country": "Other", "percentage": 3.0 }
    ]
  },
  transactions: {
    "transactions": [
      { "id": "tx-001", "createdAt": "2025-10-09T10:15:00Z", "user": "user-1234", "amount": 45.99, "currency": "USD", "country": "USA", "method": "Card", "status": "success" },
      { "id": "tx-002", "createdAt": "2025-10-09T10:20:00Z", "user": "user-5678", "amount": 89.50, "currency": "USD", "country": "Canada", "method": "PayPal", "status": "success" },
      { "id": "tx-003", "createdAt": "2025-10-09T10:25:00Z", "user": "user-9101", "amount": 120.00, "currency": "EUR", "country": "Germany", "method": "Card", "status": "success" }
    ]
  },
  sales: {
    "kpi": {
      "totalSales": 125430,
      "transactions": 1247,
      "arpu": 100.58,
      "currency": "USD"
    },
    "trend": [
      { "timestamp": "2025-10-01T00:00:00Z", "value": 14230 },
      { "timestamp": "2025-10-02T00:00:00Z", "value": 15890 }
    ]
  },
  revenue: {
    "kpi": {
      "totalRevenue": 245680,
      "averageOrderValue": 196.95,
      "revenuePerVisitor": 4.87,
      "netIncome": 98500,
      "monthlyGrowth": 15.3,
      "currency": "USD"
    },
    "trend": [
      { "timestamp": "2025-10-01T00:00:00Z", "value": 28340 },
      { "timestamp": "2025-10-02T00:00:00Z", "value": 31250 }
    ]
  }
};

describe('Data Loading Integration Tests', () => {
  let mockHttpClient: HttpClient;
  let loadDashboardUseCase: LoadDashboardUseCase;
  let presenter: DashboardPresenter;

  beforeEach(() => {
    // Создаем mock HttpClient
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    };

    // Unbind existing HttpClient and bind mock
    if (container.isBound(ROOT_TYPES.HttpClient)) {
      container.unbind(ROOT_TYPES.HttpClient);
    }
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).toConstantValue(mockHttpClient);

    // Bind repositories
    container.bind(TYPES.GeographyRepository).to(GeographyRepository);
    container.bind(TYPES.TransactionsRepository).to(TransactionsRepository);

    // Mock other repositories with empty data
    container.bind(TYPES.SalesRepository).toConstantValue({
      getSalesSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.RevenueRepository).toConstantValue({
      getRevenueSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.ConversionRepository).toConstantValue({
      getConversionSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.RetentionRepository).toConstantValue({
      getRetentionSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.CohortRepository).toConstantValue({
      getCohortSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.PaymentMethodsRepository).toConstantValue({
      getPaymentMethodsSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.RefundsRepository).toConstantValue({
      getRefundsSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.MarketingChannelsRepository).toConstantValue({
      getMarketingChannelsSummary: vi.fn().mockResolvedValue(null)
    });
    container.bind(TYPES.DashboardRepository).toConstantValue({
      createDashboard: vi.fn().mockImplementation((...args) => ({ /* mock dashboard */ }))
    });
    container.bind(TYPES.FilterPresetRepository).toConstantValue({
      getPresets: vi.fn().mockResolvedValue([]),
      savePreset: vi.fn().mockResolvedValue(undefined)
    });

    // Bind Use Cases
    container.bind(TYPES.LoadDashboardUseCase).to(LoadDashboardUseCase);
    container.bind(TYPES.SubscribeRealtimeUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });
    container.bind(TYPES.UnsubscribeRealtimeUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });
    container.bind(TYPES.ApplySettingsUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });
    container.bind(TYPES.ResetSettingsUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });
    container.bind(TYPES.LoadSettingsUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });
    container.bind(TYPES.LoadPresetsUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });
    container.bind(TYPES.SavePresetUseCase).toConstantValue({
      execute: vi.fn().mockResolvedValue(undefined)
    });

    // Resolve use cases
    loadDashboardUseCase = container.get<LoadDashboardUseCase>(TYPES.LoadDashboardUseCase);
    
    // Get other use cases from container
    const subscribeRealtimeUseCase = container.get(TYPES.SubscribeRealtimeUseCase);
    const unsubscribeRealtimeUseCase = container.get(TYPES.UnsubscribeRealtimeUseCase);
    const applySettingsUseCase = container.get(TYPES.ApplySettingsUseCase);
    const resetSettingsUseCase = container.get(TYPES.ResetSettingsUseCase);
    const loadSettingsUseCase = container.get(TYPES.LoadSettingsUseCase);
    const loadPresetsUseCase = container.get(TYPES.LoadPresetsUseCase);
    const savePresetUseCase = container.get(TYPES.SavePresetUseCase);

    presenter = new DashboardPresenter(
      loadDashboardUseCase,
      subscribeRealtimeUseCase,
      unsubscribeRealtimeUseCase,
      applySettingsUseCase,
      resetSettingsUseCase,
      loadSettingsUseCase,
      loadPresetsUseCase,
      savePresetUseCase,
      () => {} // Mock onViewModelChanged
    );
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Geography Data Loading', () => {
    it('should load geography data successfully', async () => {
      // Mock HTTP response for geography
      mockHttpClient.get.mockImplementation((url: string) => {
        if (url === '/api/geography/summary') {
          return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: mockData.geography
          });
        }
        return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      expect(viewModel.dashboard).not.toBeNull();
      expect(viewModel.dashboard?.geographySummary).toBeDefined();
      expect(viewModel.dashboard?.geographySummary?.regions).toHaveLength(5);
      expect(viewModel.dashboard?.geographySummary?.regions[0].country).toBe('US');
      expect(viewModel.dashboard?.geographySummary?.regions[0].percentage).toBe(45.0);

      // Проверяем, что API был вызван с правильным URL
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/geography/summary');
    });

    it('should handle geography data loading errors', async () => {
      // Mock HTTP error for geography
      mockHttpClient.get.mockImplementation((url: string) => {
        if (url === '/api/geography/summary') {
          return Promise.resolve({
            status: 404,
            statusText: 'Not Found',
            data: null
          });
        }
        return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
      });

      // Тест проверяет, что ошибка не приводит к краху приложения
      await expect(presenter.loadDashboard('test-user')).resolves.not.toThrow();
      
      const viewModel = presenter.getViewModel();
      expect(viewModel.isLoading).toBe(false);
    });
  });

  describe('Transactions Data Loading', () => {
    it('should load transactions data successfully', async () => {
      // Mock HTTP response for transactions
      mockHttpClient.get.mockImplementation((url: string) => {
        if (url === '/api/transactions/summary') {
          return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: mockData.transactions
          });
        }
        return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      expect(viewModel.dashboard).not.toBeNull();
      expect(viewModel.dashboard?.transactionsSummary).toBeDefined();
      expect(viewModel.dashboard?.transactionsSummary?.transactions).toHaveLength(3);
      expect(viewModel.dashboard?.transactionsSummary?.transactions[0].id).toBe('tx-001');
      expect(viewModel.dashboard?.transactionsSummary?.transactions[0].amount).toBe(45.99);

      // Проверяем, что API был вызван с правильным URL
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/transactions/summary');
    });

    it('should handle transactions data loading errors', async () => {
      // Mock HTTP error for transactions
      mockHttpClient.get.mockImplementation((url: string) => {
        if (url === '/api/transactions/summary') {
          return Promise.resolve({
            status: 500,
            statusText: 'Internal Server Error',
            data: null
          });
        }
        return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      expect(viewModel.errorMessage).toContain('Failed to fetch transactions data');
    });
  });

  describe('Complete Dashboard Loading', () => {
    it('should load all dashboard data successfully', async () => {
      // Mock HTTP responses for all endpoints
      mockHttpClient.get.mockImplementation((url: string) => {
        switch (url) {
          case '/api/geography/summary':
            return Promise.resolve({
              status: 200,
              statusText: 'OK',
              data: mockData.geography
            });
          case '/api/transactions/summary':
            return Promise.resolve({
              status: 200,
              statusText: 'OK',
              data: mockData.transactions
            });
          default:
            return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
        }
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      
      // Проверяем, что дашборд загружен
      expect(viewModel.dashboard).not.toBeNull();
      expect(viewModel.isLoading).toBe(false);
      expect(viewModel.errorMessage).toBeNull();

      // Проверяем, что данные загружены
      expect(viewModel.dashboard?.geographySummary).toBeDefined();
      expect(viewModel.dashboard?.transactionsSummary).toBeDefined();

      // Проверяем, что все API были вызваны
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/geography/summary');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/transactions/summary');
    });

    it('should handle partial data loading failures', async () => {
      // Mock HTTP responses - geography succeeds, transactions fails
      mockHttpClient.get.mockImplementation((url: string) => {
        switch (url) {
          case '/api/geography/summary':
            return Promise.resolve({
              status: 200,
              statusText: 'OK',
              data: mockData.geography
            });
          case '/api/transactions/summary':
            return Promise.resolve({
              status: 500,
              statusText: 'Internal Server Error',
              data: null
            });
          default:
            return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
        }
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      
      // Проверяем состояние загрузки
      expect(viewModel.isLoading).toBe(false);
      
      // Проверяем, что есть ошибка
      expect(viewModel.errorMessage).toBeDefined();
      expect(viewModel.errorMessage).toMatch(/Failed to fetch transactions data/);

      // При ошибке дашборд может быть не создан
      if (viewModel.dashboard) {
        // Если дашборд создан, проверяем geography данные
        expect(viewModel.dashboard.geographySummary).toBeDefined();
        expect(viewModel.dashboard.geographySummary?.regions).toHaveLength(5);
      } else {
        // Если дашборд не создан из-за ошибки, это тоже нормально
        expect(viewModel.dashboard).toBeNull();
      }
    });
  });

  describe('Loading States', () => {
    it('should show loading state during data loading', async () => {
      // Mock slow HTTP response
      mockHttpClient.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ status: 200, statusText: 'OK', data: {} });
          }, 100);
        });
      });

      // Start loading
      const loadingPromise = presenter.loadDashboard('test-user');

      // Check loading state
      let viewModel = presenter.getViewModel();
      expect(viewModel.isLoading).toBe(true);
      expect(viewModel.dashboard).toBeNull();

      // Wait for loading to complete
      await loadingPromise;

      // Check final state
      viewModel = presenter.getViewModel();
      expect(viewModel.isLoading).toBe(false);
      expect(viewModel.dashboard).not.toBeNull();
    });

    it('should handle loading errors gracefully', async () => {
      // Mock HTTP error
      mockHttpClient.get.mockImplementation(() => {
        return Promise.resolve({
          status: 500,
          statusText: 'Internal Server Error',
          data: null
        });
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      expect(viewModel.isLoading).toBe(false);
      expect(viewModel.errorMessage).toContain('Failed to fetch');
      expect(viewModel.dashboard).toBeNull();
    });
  });

  describe('Data Display Validation', () => {
    it('should validate geography data for display', async () => {
      mockHttpClient.get.mockImplementation((url: string) => {
        if (url === '/api/geography/summary') {
          return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: mockData.geography
          });
        }
        return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      const geographySummary = viewModel.dashboard?.geographySummary;

      // Проверяем, что данные готовы для отображения
      expect(geographySummary).toBeDefined();
      expect(geographySummary?.regions).toHaveLength(5);
      
      // Проверяем, что данные валидны для UI
      geographySummary?.regions.forEach(region => {
        expect(region.country).toBeDefined();
        expect(region.percentage).toBeGreaterThan(0);
        expect(region.percentage).toBeLessThanOrEqual(100);
      });

      // Проверяем, что проценты в сумме дают 100%
      const totalPercentage = geographySummary?.regions.reduce((sum, region) => sum + region.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should validate transactions data for display', async () => {
      mockHttpClient.get.mockImplementation((url: string) => {
        if (url === '/api/transactions/summary') {
          return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: mockData.transactions
          });
        }
        return Promise.resolve({ status: 200, statusText: 'OK', data: {} });
      });

      await presenter.loadDashboard('test-user');

      const viewModel = presenter.getViewModel();
      const transactionsSummary = viewModel.dashboard?.transactionsSummary;

      // Проверяем, что данные готовы для отображения
      expect(transactionsSummary).toBeDefined();
      expect(transactionsSummary?.transactions).toHaveLength(3);
      
      // Проверяем, что данные валидны для UI таблицы
      transactionsSummary?.transactions.forEach(transaction => {
        expect(transaction.id).toBeDefined();
        expect(transaction.amount).toBeGreaterThan(0);
        expect(transaction.currency).toBeDefined();
        expect(transaction.status).toBeDefined();
        expect(['success', 'refunded', 'chargeback', 'failed']).toContain(transaction.status);
      });
    });
  });
});
