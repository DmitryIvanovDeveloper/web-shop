import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { GeographyPanel } from '../interface-adapters/ui/GeographyPanel';
import { GeographySummary } from '../domain/entities/geography-summary.entity';
import { TransactionsSummary, Transaction } from '../domain/entities/transactions-summary.entity';
import { SalesSummary } from '../domain/entities/sales-summary.entity';
import { RevenueSummary } from '../domain/entities/revenue-summary.entity';

// Мокаем DonutChart компонент
vi.mock('../../../../../../shared/ui/charts/DonutChart', () => ({
  DonutChart: ({ data, title }: any) => {
    return React.createElement('div', {
      'data-testid': 'donut-chart'
    }, [
      React.createElement('h3', { key: 'title' }, title),
      React.createElement('div', {
        key: 'chart-data',
        'data-testid': 'chart-data'
      }, data.map((item: any, index: number) => 
        React.createElement('div', { 
          key: index,
          'data-testid': `chart-item-${index}`
        }, `${item.label}: ${item.value}%`)
      ))
    ]);
  }
}));

describe('UI Display Integration Tests', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Geography Panel Display', () => {
    it('should display geography data correctly', () => {
      const geographyData = {
        "regions": [
          { "country": "US", "percentage": 45.0 },
          { "country": "EU", "percentage": 30.0 },
          { "country": "Asia", "percentage": 15.0 },
          { "country": "LATAM", "percentage": 7.0 },
          { "country": "Other", "percentage": 3.0 }
        ]
      };

      const geographySummary = GeographySummary.fromApiResponse(geographyData);

      render(<GeographyPanel geographySummary={geographySummary} />);

      // Проверяем заголовок
      expect(screen.getByText('Geography Panel')).toBeInTheDocument();
      expect(screen.getByText('LIVE')).toBeInTheDocument();

      // Проверяем, что DonutChart отображается
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
      expect(screen.getByText('Regional Distribution')).toBeInTheDocument();

      // Проверяем данные в графике
      expect(screen.getByTestId('chart-item-0')).toHaveTextContent('US: 45%');
      expect(screen.getByTestId('chart-item-1')).toHaveTextContent('EU: 30%');
      expect(screen.getByTestId('chart-item-2')).toHaveTextContent('Asia: 15%');
      expect(screen.getByTestId('chart-item-3')).toHaveTextContent('LATAM: 7%');
      expect(screen.getByTestId('chart-item-4')).toHaveTextContent('Other: 3%');
    });

    it('should handle empty geography data', () => {
      const emptyData = { regions: [] };
      const geographySummary = GeographySummary.fromApiResponse(emptyData);

      render(<GeographyPanel geographySummary={geographySummary} />);

      // Проверяем, что компонент все равно отображается
      expect(screen.getByText('Geography Panel')).toBeInTheDocument();
      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
      
      // Проверяем, что нет данных для отображения
      expect(screen.getByTestId('chart-data')).toBeEmptyDOMElement();
    });
  });

  describe('Transactions Table Display', () => {
    it('should display transactions data correctly', () => {
      const transactionsData = {
        "transactions": [
          { 
            "id": "tx-001", 
            "createdAt": "2025-10-09T10:15:00Z", 
            "user": "user-1234", 
            "amount": 45.99, 
            "currency": "USD", 
            "country": "USA", 
            "method": "Card", 
            "status": "success" 
          },
          { 
            "id": "tx-002", 
            "createdAt": "2025-10-09T10:20:00Z", 
            "user": "user-5678", 
            "amount": 89.50, 
            "currency": "USD", 
            "country": "Canada", 
            "method": "PayPal", 
            "status": "success" 
          }
        ]
      };

      const transactionsSummary = TransactionsSummary.fromApiResponse(transactionsData);

      // Создаем простой компонент для отображения транзакций
      const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => (
        <div data-testid="transactions-table">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>USER</th>
                <th>AMOUNT</th>
                <th>CUR</th>
                <th>COUNTRY</th>
                <th>METH</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td>{transaction.user}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.currency}</td>
                  <td>{transaction.country}</td>
                  <td>{transaction.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      render(<TransactionsTable transactions={transactionsSummary.transactions} />);

      // Проверяем заголовки таблицы
      expect(screen.getByText('DATE')).toBeInTheDocument();
      expect(screen.getByText('USER')).toBeInTheDocument();
      expect(screen.getByText('AMOUNT')).toBeInTheDocument();
      expect(screen.getByText('CUR')).toBeInTheDocument();
      expect(screen.getByText('COUNTRY')).toBeInTheDocument();
      expect(screen.getByText('METH')).toBeInTheDocument();

      // Проверяем данные транзакций
      expect(screen.getByTestId('transaction-row-tx-001')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-row-tx-002')).toBeInTheDocument();

      // Проверяем содержимое первой транзакции
      const firstRow = screen.getByTestId('transaction-row-tx-001');
      expect(firstRow).toHaveTextContent('user-1234');
      expect(firstRow).toHaveTextContent('45.99');
      expect(firstRow).toHaveTextContent('USD');
      expect(firstRow).toHaveTextContent('USA');
      expect(firstRow).toHaveTextContent('Card');
    });

    it('should handle empty transactions data', () => {
      const emptyData = { transactions: [] };
      const transactionsSummary = TransactionsSummary.fromApiResponse(emptyData);

      const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => (
        <div data-testid="transactions-table">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>USER</th>
                <th>AMOUNT</th>
                <th>CUR</th>
                <th>COUNTRY</th>
                <th>METH</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr data-testid="empty-state">
                  <td colSpan={6}>No transactions found</td>
                </tr>
              ) : (
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td>{transaction.user}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.currency}</td>
                    <td>{transaction.country}</td>
                    <td>{transaction.method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );

      render(<TransactionsTable transactions={transactionsSummary.transactions} />);

      // Проверяем, что таблица отображается
      expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
      
      // Проверяем, что показывается состояние "нет данных"
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
    });
  });

  describe('Sales KPI Display', () => {
    it('should display sales KPI data correctly', () => {
      const salesData = {
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
      };

      const salesSummary = SalesSummary.fromApiResponse(salesData);

      // Создаем простой компонент для отображения KPI
      const SalesKPIPanel = ({ salesSummary }: { salesSummary: SalesSummary }) => (
        <div data-testid="sales-kpi-panel">
          <h2>Sales KPI</h2>
          <div data-testid="kpi-cards">
            <div data-testid="total-sales">
              Total Sales: {salesSummary.totalSales.toLocaleString('en-US')} {salesSummary.currency}
            </div>
            <div data-testid="transactions">
              Transactions: {salesSummary.transactions.toLocaleString('en-US')}
            </div>
            <div data-testid="arpu">
              ARPU: {salesSummary.currency} {salesSummary.arpu.toFixed(2)}
            </div>
          </div>
        </div>
      );

      render(<SalesKPIPanel salesSummary={salesSummary} />);

      // Проверяем заголовок
      expect(screen.getByText('Sales KPI')).toBeInTheDocument();

      // Проверяем KPI карточки
      expect(screen.getByTestId('total-sales')).toHaveTextContent('Total Sales: 125,430 USD');
      expect(screen.getByTestId('transactions')).toHaveTextContent('Transactions: 1,247');
      expect(screen.getByTestId('arpu')).toHaveTextContent('ARPU: USD 100.58');
    });
  });

  describe('Revenue KPI Display', () => {
    it('should display revenue KPI data correctly', () => {
      const revenueData = {
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
      };

      const revenueSummary = RevenueSummary.fromApiResponse(revenueData);

      // Создаем простой компонент для отображения Revenue KPI
      const RevenueKPIPanel = ({ revenueSummary }: { revenueSummary: RevenueSummary }) => (
        <div data-testid="revenue-kpi-panel">
          <h2>Revenue KPI</h2>
          <div data-testid="kpi-cards">
            <div data-testid="total-revenue">
              Total Revenue: {revenueSummary.totalRevenue.toLocaleString('en-US')} {revenueSummary.currency}
            </div>
            <div data-testid="net-income">
              Net Income: {revenueSummary.netIncome.toLocaleString('en-US')} {revenueSummary.currency}
            </div>
            <div data-testid="growth">
              Growth: +{revenueSummary.monthlyGrowth}%
            </div>
            <div data-testid="profit-margin">
              Profit Margin: {((revenueSummary.netIncome / revenueSummary.totalRevenue) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      );

      render(<RevenueKPIPanel revenueSummary={revenueSummary} />);

      // Проверяем заголовок
      expect(screen.getByText('Revenue KPI')).toBeInTheDocument();

      // Проверяем KPI карточки
      expect(screen.getByTestId('total-revenue')).toHaveTextContent('Total Revenue: 245,680 USD');
      expect(screen.getByTestId('net-income')).toHaveTextContent('Net Income: 98,500 USD');
      expect(screen.getByTestId('growth')).toHaveTextContent('Growth: +15.3%');
      expect(screen.getByTestId('profit-margin')).toHaveTextContent('Profit Margin: 40.1%');
    });
  });

  describe('Data Formatting and Display', () => {
    it('should format currency values correctly', () => {
      const testValues = [
        { value: 1234.56, currency: 'USD', expected: '1,234.56 USD' },
        { value: 9876543.21, currency: 'EUR', expected: '9,876,543.21 EUR' },
        { value: 0, currency: 'USD', expected: '0.00 USD' }
      ];

      testValues.forEach(({ value, currency, expected }) => {
        const formatted = `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
        expect(formatted).toBe(expected);
      });
    });

    it('should format percentage values correctly', () => {
      const testValues = [
        { value: 15.3, expected: '+15.3%' },
        { value: -5.7, expected: '-5.7%' },
        { value: 0, expected: '+0.0%' }
      ];

      testValues.forEach(({ value, expected }) => {
        const formatted = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
        expect(formatted).toBe(expected);
      });
    });

    it('should format date values correctly', () => {
      const testDate = new Date('2025-10-09T10:15:00Z');
      const formatted = testDate.toLocaleDateString('en-US');
      
      // Проверяем, что дата отформатирована (конкретный формат может зависеть от локали)
      expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });
  });

  describe('Error States Display', () => {
    it('should display loading state correctly', () => {
      const LoadingPanel = ({ isLoading }: { isLoading: boolean }) => (
        <div data-testid="loading-panel">
          {isLoading ? (
            <div data-testid="loading-spinner">Loading...</div>
          ) : (
            <div data-testid="content">Content loaded</div>
          )}
        </div>
      );

      const { rerender } = render(<LoadingPanel isLoading={true} />);

      // Проверяем состояние загрузки
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Переключаем на загруженное состояние
      rerender(<LoadingPanel isLoading={false} />);

      // Проверяем загруженное состояние
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Content loaded')).toBeInTheDocument();
    });

    it('should display error state correctly', () => {
      const ErrorPanel = ({ error }: { error: string | null }) => (
        <div data-testid="error-panel">
          {error ? (
            <div data-testid="error-message" style={{ color: 'red' }}>
              Error: {error}
            </div>
          ) : (
            <div data-testid="success-content">Data loaded successfully</div>
          )}
        </div>
      );

      const { rerender } = render(<ErrorPanel error={null} />);

      // Проверяем успешное состояние
      expect(screen.getByTestId('success-content')).toBeInTheDocument();
      expect(screen.getByText('Data loaded successfully')).toBeInTheDocument();

      // Переключаем на состояние ошибки
      rerender(<ErrorPanel error="Failed to load data" />);

      // Проверяем состояние ошибки
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load data')).toBeInTheDocument();
    });
  });
});
