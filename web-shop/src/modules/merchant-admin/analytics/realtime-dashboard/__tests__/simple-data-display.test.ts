import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeographySummary } from '../domain/entities/geography-summary.entity';
import { TransactionsSummary, Transaction } from '../domain/entities/transactions-summary.entity';
import { SalesSummary } from '../domain/entities/sales-summary.entity';
import { RevenueSummary } from '../domain/entities/revenue-summary.entity';

describe('Simple Data Display Tests', () => {
  describe('Geography Data Display', () => {
    it('should format geography data for display', () => {
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

      // Проверяем, что данные загружены
      expect(geographySummary.regions).toHaveLength(5);
      expect(geographySummary.regions[0].country).toBe('US');
      expect(geographySummary.regions[0].percentage).toBe(45.0);

      // Проверяем форматирование для отображения
      const displayData = geographySummary.regions.map(region => ({
        label: region.country,
        value: region.percentage,
        formatted: `${region.country}: ${region.percentage}%`
      }));

      expect(displayData[0].formatted).toBe('US: 45%');
      expect(displayData[1].formatted).toBe('EU: 30%');
      expect(displayData[2].formatted).toBe('Asia: 15%');

      // Проверяем, что проценты в сумме дают 100%
      const totalPercentage = geographySummary.regions.reduce((sum, region) => sum + region.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should handle empty geography data', () => {
      const emptyData = { regions: [] };
      const geographySummary = GeographySummary.fromApiResponse(emptyData);

      expect(geographySummary.regions).toHaveLength(0);
      
      // Проверяем, что форматирование работает с пустыми данными
      const displayData = geographySummary.regions.map(region => ({
        label: region.country,
        value: region.percentage,
        formatted: `${region.country}: ${region.percentage}%`
      }));

      expect(displayData).toHaveLength(0);
    });
  });

  describe('Transactions Data Display', () => {
    it('should format transactions data for table display', () => {
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

      // Проверяем, что данные загружены
      expect(transactionsSummary.transactions).toHaveLength(2);
      expect(transactionsSummary.transactions[0].id).toBe('tx-001');
      expect(transactionsSummary.transactions[0].amount).toBe(45.99);

      // Проверяем форматирование для таблицы
      const tableData = transactionsSummary.transactions.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.createdAt).toLocaleDateString(),
        user: transaction.user,
        amount: `${transaction.amount} ${transaction.currency}`,
        country: transaction.country,
        method: transaction.method,
        status: transaction.status
      }));

      expect(tableData[0].id).toBe('tx-001');
      expect(tableData[0].amount).toBe('45.99 USD');
      expect(tableData[0].country).toBe('USA');
      expect(tableData[0].method).toBe('Card');
      expect(tableData[0].status).toBe('success');

      // Проверяем, что дата отформатирована (формат может зависеть от локали)
      expect(tableData[0].date).toMatch(/^\d{1,2}[./]\d{1,2}[./]\d{4}$/);
    });

    it('should handle empty transactions data', () => {
      const emptyData = { transactions: [] };
      const transactionsSummary = TransactionsSummary.fromApiResponse(emptyData);

      expect(transactionsSummary.transactions).toHaveLength(0);
      
      // Проверяем, что форматирование работает с пустыми данными
      const tableData = transactionsSummary.transactions.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.createdAt).toLocaleDateString(),
        user: transaction.user,
        amount: `${transaction.amount} ${transaction.currency}`,
        country: transaction.country,
        method: transaction.method,
        status: transaction.status
      }));

      expect(tableData).toHaveLength(0);
    });
  });

  describe('Sales KPI Display', () => {
    it('should format sales KPI data for display', () => {
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

      // Проверяем, что данные загружены
      expect(salesSummary.totalSales).toBe(125430);
      expect(salesSummary.transactions).toBe(1247);
      expect(salesSummary.arpu).toBeCloseTo(100.58, 2);

      // Проверяем форматирование для KPI карточек
      const kpiData = {
        totalSales: {
          value: salesSummary.totalSales,
          formatted: `${salesSummary.totalSales.toLocaleString('en-US')} ${salesSummary.currency}`
        },
        transactions: {
          value: salesSummary.transactions,
          formatted: salesSummary.transactions.toLocaleString('en-US')
        },
        arpu: {
          value: salesSummary.arpu,
          formatted: `${salesSummary.currency} ${salesSummary.arpu.toFixed(2)}`
        }
      };

      expect(kpiData.totalSales.formatted).toBe('125,430 USD');
      expect(kpiData.transactions.formatted).toBe('1,247');
      expect(kpiData.arpu.formatted).toBe('USD 100.58');
    });
  });

  describe('Revenue KPI Display', () => {
    it('should format revenue KPI data for display', () => {
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

      // Проверяем, что данные загружены
      expect(revenueSummary.totalRevenue).toBe(245680);
      expect(revenueSummary.netIncome).toBe(98500);
      expect(revenueSummary.monthlyGrowth).toBeCloseTo(15.3, 1);

      // Проверяем форматирование для KPI карточек
      const kpiData = {
        totalRevenue: {
          value: revenueSummary.totalRevenue,
          formatted: `${revenueSummary.totalRevenue.toLocaleString('en-US')} ${revenueSummary.currency}`
        },
        netIncome: {
          value: revenueSummary.netIncome,
          formatted: `${revenueSummary.netIncome.toLocaleString('en-US')} ${revenueSummary.currency}`
        },
        growth: {
          value: revenueSummary.monthlyGrowth,
          formatted: `+${revenueSummary.monthlyGrowth}%`
        },
        profitMargin: {
          value: (revenueSummary.netIncome / revenueSummary.totalRevenue) * 100,
          formatted: `${((revenueSummary.netIncome / revenueSummary.totalRevenue) * 100).toFixed(1)}%`
        }
      };

      expect(kpiData.totalRevenue.formatted).toBe('245,680 USD');
      expect(kpiData.netIncome.formatted).toBe('98,500 USD');
      expect(kpiData.growth.formatted).toBe('+15.3%');
      expect(kpiData.profitMargin.formatted).toBe('40.1%');
    });
  });

  describe('Data Validation for Display', () => {
    it('should validate geography data quality for display', () => {
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

      // Проверяем качество данных
      const validationResults = {
        hasValidStructure: Array.isArray(geographySummary.regions),
        hasValidRegions: geographySummary.regions.every(region => 
          typeof region.country === 'string' && region.country.length > 0
        ),
        hasValidPercentages: geographySummary.regions.every(region => 
          typeof region.percentage === 'number' && region.percentage > 0
        ),
        totalPercentageValid: Math.abs(
          geographySummary.regions.reduce((sum, region) => sum + region.percentage, 0) - 100
        ) < 0.1
      };

      expect(validationResults.hasValidStructure).toBe(true);
      expect(validationResults.hasValidRegions).toBe(true);
      expect(validationResults.hasValidPercentages).toBe(true);
      expect(validationResults.totalPercentageValid).toBe(true);
    });

    it('should validate transactions data quality for display', () => {
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
          }
        ]
      };

      const transactionsSummary = TransactionsSummary.fromApiResponse(transactionsData);

      // Проверяем качество данных
      const validationResults = {
        hasValidStructure: Array.isArray(transactionsSummary.transactions),
        hasValidTransactions: transactionsSummary.transactions.every(transaction => 
          typeof transaction.id === 'string' && transaction.id.length > 0
        ),
        hasValidAmounts: transactionsSummary.transactions.every(transaction => 
          typeof transaction.amount === 'number' && transaction.amount > 0
        ),
        hasValidStatuses: transactionsSummary.transactions.every(transaction => 
          ['success', 'refunded', 'chargeback', 'failed'].includes(transaction.status)
        ),
        hasValidCurrencies: transactionsSummary.transactions.every(transaction => 
          typeof transaction.currency === 'string' && transaction.currency.length > 0
        )
      };

      expect(validationResults.hasValidStructure).toBe(true);
      expect(validationResults.hasValidTransactions).toBe(true);
      expect(validationResults.hasValidAmounts).toBe(true);
      expect(validationResults.hasValidStatuses).toBe(true);
      expect(validationResults.hasValidCurrencies).toBe(true);
    });
  });

  describe('Error Handling in Display', () => {
    it('should handle malformed geography data gracefully', () => {
      const malformedData = {
        items: [ // Wrong property name
          { countryCode: 'US', value: 45.0 } // Wrong property names
        ]
      };

      // GeographySummary.fromApiResponse может вернуть undefined regions
      const geographySummary = GeographySummary.fromApiResponse(malformedData);
      expect(geographySummary.regions || []).toEqual([]);

      // Проверяем, что форматирование работает с пустыми данными
      const displayData = (geographySummary.regions || []).map(region => ({
        label: region.country,
        value: region.percentage,
        formatted: `${region.country}: ${region.percentage}%`
      }));

      expect(displayData).toHaveLength(0);
    });

    it('should handle malformed transactions data gracefully', () => {
      const malformedData = {
        items: [ // Wrong property name
          { transactionId: 'tx-001', price: 45.99 } // Wrong property names
        ]
      };

      // TransactionsSummary.fromApiResponse не валидирует, поэтому transactions будет пустым массивом
      const transactionsSummary = TransactionsSummary.fromApiResponse(malformedData);
      expect(transactionsSummary.transactions).toEqual([]);

      // Проверяем, что форматирование работает с пустыми данными
      const tableData = transactionsSummary.transactions.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.createdAt).toLocaleDateString(),
        user: transaction.user,
        amount: `${transaction.amount} ${transaction.currency}`,
        country: transaction.country,
        method: transaction.method,
        status: transaction.status
      }));

      expect(tableData).toHaveLength(0);
    });
  });
});
