import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionsSummary, Transaction } from '../domain/entities/transactions-summary.entity';

// Реальные JSON данные (копия из public/mocks/api/transactions/summary.json)
const transactionsData = {
  "transactions": [
    { "id": "tx-001", "createdAt": "2025-10-09T10:15:00Z", "user": "user-1234", "amount": 45.99, "currency": "USD", "country": "USA", "method": "Card", "status": "success" },
    { "id": "tx-002", "createdAt": "2025-10-09T10:20:00Z", "user": "user-5678", "amount": 89.50, "currency": "USD", "country": "Canada", "method": "PayPal", "status": "success" },
    { "id": "tx-003", "createdAt": "2025-10-09T10:25:00Z", "user": "user-9101", "amount": 120.00, "currency": "EUR", "country": "Germany", "method": "Card", "status": "success" },
    { "id": "tx-004", "createdAt": "2025-10-09T10:30:00Z", "user": "user-1121", "amount": 35.00, "currency": "GBP", "country": "UK", "method": "Carrier Billing", "status": "success" },
    { "id": "tx-005", "createdAt": "2025-10-09T10:35:00Z", "user": "user-3141", "amount": 55.00, "currency": "USD", "country": "USA", "method": "Card", "status": "refunded" },
    { "id": "tx-006", "createdAt": "2025-10-09T10:40:00Z", "user": "user-5161", "amount": 99.99, "currency": "USD", "country": "Australia", "method": "PayPal", "status": "success" },
    { "id": "tx-007", "createdAt": "2025-10-09T10:45:00Z", "user": "user-7181", "amount": 75.00, "currency": "EUR", "country": "France", "method": "Card", "status": "chargeback" },
    { "id": "tx-008", "createdAt": "2025-10-09T10:50:00Z", "user": "user-9202", "amount": 60.00, "currency": "USD", "country": "USA", "method": "Card", "status": "success" },
    { "id": "tx-009", "createdAt": "2025-10-09T10:55:00Z", "user": "user-1222", "amount": 110.00, "currency": "USD", "country": "Canada", "method": "PayPal", "status": "success" },
    { "id": "tx-010", "createdAt": "2025-10-09T11:00:00Z", "user": "user-3242", "amount": 85.00, "currency": "GBP", "country": "UK", "method": "Card", "status": "failed" }
  ]
};

describe('Transactions Data Flow - Real Data Integration Tests', () => {
  describe('Data Flow Tests with Real JSON Data', () => {
    it('should process real transactions data from JSON to entity', () => {
      // Шаг 1: JSON данные (как приходят из API)
      const apiResponse = transactionsData;
      
      // Шаг 2: Создание entity из API response
      const transactionsSummary = TransactionsSummary.fromApiResponse(apiResponse);
      
      // Шаг 3: Проверка корректности преобразования
      expect(transactionsSummary).toBeInstanceOf(TransactionsSummary);
      expect(transactionsSummary.transactions).toHaveLength(10);
      expect(transactionsSummary.transactions[0].id).toBe('tx-001');
      expect(transactionsSummary.transactions[0].amount).toBe(45.99);
      expect(transactionsSummary.transactions[0].currency).toBe('USD');
      expect(transactionsSummary.transactions[0].status).toBe('success');
    });

    it('should validate complete data flow from JSON to business logic', () => {
      // Полный цикл: JSON -> Entity -> Business Logic -> Results
      
      // 1. Исходные JSON данные
      const apiResponse = transactionsData;
      
      // 2. Преобразование в domain entity
      const transactionsSummary = TransactionsSummary.fromApiResponse(apiResponse);
      
      // 3. Применение бизнес-логики
      const successfulTransactions = transactionsSummary.transactions.filter(t => t.status === 'success');
      const totalAmount = transactionsSummary.transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = totalAmount / transactionsSummary.transactions.length;
      
      const transactionsByCountry = transactionsSummary.transactions.reduce((acc, t) => {
        acc[t.country || 'Unknown'] = (acc[t.country || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // 4. Проверка результатов
      expect(successfulTransactions).toHaveLength(7); // 7 успешных транзакций
      expect(totalAmount).toBeCloseTo(775.48, 2); // Общая сумма
      expect(averageAmount).toBeCloseTo(77.55, 2); // Средняя сумма
      expect(transactionsByCountry['USA']).toBe(3); // 3 транзакции из USA
      expect(transactionsByCountry['Canada']).toBe(2); // 2 транзакции из Canada
    });

    it('should handle data transformations in the flow', () => {
      const transactionsSummary = TransactionsSummary.fromApiResponse(transactionsData);
      
      // Преобразования данных для UI таблицы
      const tableData = transactionsSummary.transactions.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.createdAt).toLocaleDateString(),
        user: transaction.user,
        amount: `${transaction.amount} ${transaction.currency}`,
        country: transaction.country,
        method: transaction.method,
        status: transaction.status
      }));
      
      // Преобразования для аналитики
      const analyticsData = {
        totalTransactions: transactionsSummary.transactions.length,
        successfulTransactions: transactionsSummary.transactions.filter(t => t.status === 'success').length,
        totalRevenue: transactionsSummary.transactions
          .filter(t => t.status === 'success')
          .reduce((sum, t) => sum + t.amount, 0),
        topCountries: Object.entries(
          transactionsSummary.transactions.reduce((acc, t) => {
            acc[t.country || 'Unknown'] = (acc[t.country || 'Unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort(([,a], [,b]) => b - a).slice(0, 3)
      };
      
      // Проверка корректности преобразований
      expect(tableData).toHaveLength(10);
      expect(tableData[0].id).toBe('tx-001');
      expect(tableData[0].amount).toBe('45.99 USD');
      expect(tableData[0].date).toBeDefined();
      
      expect(analyticsData.totalTransactions).toBe(10);
      expect(analyticsData.successfulTransactions).toBe(7);
      expect(analyticsData.totalRevenue).toBeCloseTo(560.48, 2); // Сумма только успешных
      expect(analyticsData.topCountries[0][0]).toBe('USA'); // USA - топ страна
    });
  });

  describe('Error Handling in Data Flow', () => {
    it('should handle malformed JSON data gracefully', () => {
      const malformedData = {
        items: [ // Wrong property name
          { transactionId: 'tx-001', price: 45.99 } // Wrong property names
        ]
      };
      
      // TransactionsSummary.fromApiResponse не валидирует, поэтому transactions будет пустым массивом
      const transactionsSummary = TransactionsSummary.fromApiResponse(malformedData);
      expect(transactionsSummary.transactions).toEqual([]);
    });

    it('should handle empty data in the flow', () => {
      const emptyData = { transactions: [] };
      const transactionsSummary = TransactionsSummary.fromApiResponse(emptyData);
      
      expect(transactionsSummary.transactions).toHaveLength(0);
      
      // Проверяем, что бизнес-логика работает с пустыми данными
      const successfulTransactions = transactionsSummary.transactions.filter(t => t.status === 'success');
      const totalAmount = transactionsSummary.transactions.reduce((sum, t) => sum + t.amount, 0);
      
      expect(successfulTransactions).toHaveLength(0);
      expect(totalAmount).toBe(0);
    });

    it('should handle data with missing properties', () => {
      const incompleteData = {
        transactions: [
          { id: 'tx-001', amount: 45.99, currency: 'USD', status: 'success' }, // Missing createdAt, user
          { id: 'tx-002', createdAt: '2025-10-09T10:20:00Z', amount: 89.50 } // Missing currency, status
        ]
      };
      
      const transactionsSummary = TransactionsSummary.fromApiResponse(incompleteData);
      
      // Проверяем, что данные обрабатываются (даже если неполные)
      expect(transactionsSummary.transactions).toHaveLength(2);
      expect(transactionsSummary.transactions[0].id).toBe('tx-001');
      expect(transactionsSummary.transactions[0].createdAt).toBeUndefined();
      expect(transactionsSummary.transactions[1].currency).toBeUndefined();
    });
  });

  describe('Performance Tests in Data Flow', () => {
    it('should handle large datasets efficiently', () => {
      // Создаем большой набор данных
      const largeDataset = {
        transactions: Array.from({ length: 1000 }, (_, index) => ({
          id: `tx-${index.toString().padStart(3, '0')}`,
          createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          user: `user-${index}`,
          amount: Math.random() * 1000,
          currency: ['USD', 'EUR', 'GBP'][index % 3],
          country: ['USA', 'Canada', 'Germany', 'UK'][index % 4],
          method: ['Card', 'PayPal', 'Carrier Billing'][index % 3],
          status: ['success', 'refunded', 'chargeback', 'failed'][index % 4]
        }))
      };
      
      const startTime = Date.now();
      const transactionsSummary = TransactionsSummary.fromApiResponse(largeDataset);
      
      // Применяем бизнес-логику
      const successfulTransactions = transactionsSummary.transactions.filter(t => t.status === 'success');
      const totalAmount = transactionsSummary.transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = totalAmount / transactionsSummary.transactions.length;
      
      const endTime = Date.now();
      
      // Проверяем производительность
      expect(endTime - startTime).toBeLessThan(50); // Должно быть быстро
      expect(transactionsSummary.transactions).toHaveLength(1000);
      expect(successfulTransactions.length).toBeGreaterThan(0);
      expect(typeof totalAmount).toBe('number');
      expect(typeof averageAmount).toBe('number');
    });

    it('should handle concurrent data processing', () => {
      const datasets = [
        transactionsData,
        { transactions: [{ id: 'tx-001', amount: 100, currency: 'USD', status: 'success' }] },
        { transactions: [{ id: 'tx-002', amount: 200, currency: 'EUR', status: 'success' }] }
      ];
      
      const startTime = Date.now();
      
      // Обрабатываем несколько наборов данных параллельно
      const results = datasets.map(data => {
        const summary = TransactionsSummary.fromApiResponse(data);
        const totalAmount = summary.transactions.reduce((sum, t) => sum + t.amount, 0);
        return { summary, totalAmount };
      });
      
      const endTime = Date.now();
      
      // Проверяем результаты
      expect(endTime - startTime).toBeLessThan(20); // Должно быть быстро
      expect(results).toHaveLength(3);
      expect(results[0].totalAmount).toBeCloseTo(775.48, 2);
      expect(results[1].totalAmount).toBe(100);
      expect(results[2].totalAmount).toBe(200);
    });
  });

  describe('Integration with Real Business Scenarios', () => {
    it('should simulate real dashboard data flow', () => {
      // Симулируем реальный сценарий: загрузка данных для дашборда
      
      // 1. Данные приходят с API
      const apiResponse = transactionsData;
      
      // 2. Создание domain entity
      const transactionsSummary = TransactionsSummary.fromApiResponse(apiResponse);
      
      // 3. Подготовка данных для UI компонентов
      const tableData = transactionsSummary.transactions.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.createdAt).toLocaleDateString(),
        user: transaction.user,
        amount: `${transaction.amount} ${transaction.currency}`,
        country: transaction.country,
        method: transaction.method,
        status: transaction.status
      }));
      
      const summaryStats = {
        totalTransactions: transactionsSummary.transactions.length,
        successfulTransactions: transactionsSummary.transactions.filter(t => t.status === 'success').length,
        totalRevenue: transactionsSummary.transactions
          .filter(t => t.status === 'success')
          .reduce((sum, t) => sum + t.amount, 0),
        averageTransactionValue: transactionsSummary.transactions.reduce((sum, t) => sum + t.amount, 0) / transactionsSummary.transactions.length
      };
      
      // 4. Проверка готовности данных для UI
      expect(tableData).toHaveLength(10);
      expect(tableData[0].id).toBe('tx-001');
      expect(tableData[0].amount).toBe('45.99 USD');
      
      expect(summaryStats.totalTransactions).toBe(10);
      expect(summaryStats.successfulTransactions).toBe(7);
      expect(summaryStats.totalRevenue).toBeCloseTo(560.48, 2);
      expect(summaryStats.averageTransactionValue).toBeCloseTo(77.55, 2);
    });

    it('should handle real-time data updates flow', () => {
      // Симулируем обновление данных в реальном времени
      
      // Начальные данные
      const initialData = transactionsData;
      let transactionsSummary = TransactionsSummary.fromApiResponse(initialData);
      
      // Проверяем начальное состояние
      expect(transactionsSummary.transactions).toHaveLength(10);
      expect(transactionsSummary.transactions[0].amount).toBe(45.99);
      
      // Обновленные данные (симулируем добавление новой транзакции)
      const updatedData = {
        ...transactionsData,
        transactions: [
          ...transactionsData.transactions,
          { 
            id: "tx-011", 
            createdAt: "2025-10-09T11:05:00Z", 
            user: "user-4252", 
            amount: 150.00, 
            currency: "USD", 
            country: "USA", 
            method: "Card", 
            status: "success" 
          }
        ]
      };
      
      // Применяем обновления
      transactionsSummary = TransactionsSummary.fromApiResponse(updatedData);
      
      // Проверяем, что данные обновились
      expect(transactionsSummary.transactions).toHaveLength(11);
      expect(transactionsSummary.transactions[10].id).toBe('tx-011');
      expect(transactionsSummary.transactions[10].amount).toBe(150.00);
      
      // Проверяем, что бизнес-логика работает с обновленными данными
      const totalAmount = transactionsSummary.transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(totalAmount).toBeCloseTo(925.48, 2); // 775.48 + 150.00
    });

    it('should handle data filtering and search scenarios', () => {
      const transactionsSummary = TransactionsSummary.fromApiResponse(transactionsData);
      
      // Симулируем поиск по транзакциям
      const searchResults = transactionsSummary.transactions.filter(transaction =>
        transaction.user.toLowerCase().includes('user-1234') ||
        transaction.country?.toLowerCase().includes('usa')
      );
      
      expect(searchResults.length).toBeGreaterThan(0);
      
      // Симулируем фильтрацию по статусу
      const successfulTransactions = transactionsSummary.transactions.filter(transaction =>
        transaction.status === 'success'
      );
      
      expect(successfulTransactions).toHaveLength(7);
      
      // Симулируем фильтрацию по сумме
      const highValueTransactions = transactionsSummary.transactions.filter(transaction =>
        transaction.amount > 80
      );
      
      expect(highValueTransactions.length).toBeGreaterThan(0);
      
      // Симулируем сортировку для таблицы
      const sortedByAmount = [...transactionsSummary.transactions]
        .sort((a, b) => b.amount - a.amount);
      
      expect(sortedByAmount[0].amount).toBeGreaterThanOrEqual(sortedByAmount[1].amount);
    });
  });

  describe('Data Validation and Quality Tests', () => {
    it('should validate data quality in the flow', () => {
      const transactionsSummary = TransactionsSummary.fromApiResponse(transactionsData);
      
      // Проверяем качество данных
      const validationResults = {
        hasValidStructure: Array.isArray(transactionsSummary.transactions),
        hasValidTransactions: transactionsSummary.transactions.every(t => 
          typeof t.id === 'string' && t.id.length > 0
        ),
        hasValidAmounts: transactionsSummary.transactions.every(t => 
          typeof t.amount === 'number' && t.amount > 0
        ),
        hasValidStatuses: transactionsSummary.transactions.every(t => 
          ['success', 'refunded', 'chargeback', 'failed'].includes(t.status)
        ),
        hasValidCurrencies: transactionsSummary.transactions.every(t => 
          typeof t.currency === 'string' && t.currency.length > 0
        )
      };
      
      expect(validationResults.hasValidStructure).toBe(true);
      expect(validationResults.hasValidTransactions).toBe(true);
      expect(validationResults.hasValidAmounts).toBe(true);
      expect(validationResults.hasValidStatuses).toBe(true);
      expect(validationResults.hasValidCurrencies).toBe(true);
    });

    it('should detect data anomalies', () => {
      const anomalousData = {
        transactions: [
          ...transactionsData.transactions,
          { 
            id: "tx-anomaly", 
            createdAt: "2025-10-09T11:05:00Z", 
            user: "user-anomaly", 
            amount: -100.00, // Отрицательная сумма
            currency: "USD", 
            country: "USA", 
            method: "Card", 
            status: "success" 
          },
          { 
            id: "tx-anomaly-2", 
            createdAt: "2025-10-09T11:05:00Z", 
            user: "user-anomaly-2", 
            amount: 100.00, 
            currency: "INVALID_CURRENCY", // Неверная валюта
            country: "USA", 
            method: "Card", 
            status: "unknown_status" // Неверный статус
          }
        ]
      };
      
      const transactionsSummary = TransactionsSummary.fromApiResponse(anomalousData);
      
      // Проверяем обнаружение аномалий
      const negativeAmountTransactions = transactionsSummary.transactions.filter(t => t.amount < 0);
      const invalidStatusTransactions = transactionsSummary.transactions.filter(t => 
        !['success', 'refunded', 'chargeback', 'failed'].includes(t.status)
      );
      
      expect(negativeAmountTransactions).toHaveLength(1);
      expect(negativeAmountTransactions[0].id).toBe('tx-anomaly');
      expect(invalidStatusTransactions).toHaveLength(1);
      expect(invalidStatusTransactions[0].id).toBe('tx-anomaly-2');
    });
  });
});
