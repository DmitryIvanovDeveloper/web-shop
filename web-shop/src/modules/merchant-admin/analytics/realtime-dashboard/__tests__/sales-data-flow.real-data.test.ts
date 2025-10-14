import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalesSummary } from '../domain/entities/sales-summary.entity';
import { TrendDataPoint } from '../domain/types/trend.types';

// Реальные JSON данные (копия из public/mocks/api/sales/summary.json)
const salesData = {
  "kpi": {
    "totalSales": 125430,
    "transactions": 1247,
    "arpu": 100.58,
    "currency": "USD"
  },
  "trend": [
    {
      "timestamp": "2025-10-01T00:00:00Z",
      "value": 14230
    },
    {
      "timestamp": "2025-10-02T00:00:00Z",
      "value": 15890
    },
    {
      "timestamp": "2025-10-03T00:00:00Z",
      "value": 17640
    },
    {
      "timestamp": "2025-10-04T00:00:00Z",
      "value": 16540
    },
    {
      "timestamp": "2025-10-05T00:00:00Z",
      "value": 18920
    },
    {
      "timestamp": "2025-10-06T00:00:00Z",
      "value": 21100
    },
    {
      "timestamp": "2025-10-07T00:00:00Z",
      "value": 19870
    },
    {
      "timestamp": "2025-10-08T00:00:00Z",
      "value": 23240
    }
  ]
};

describe('Sales Data Flow - Real Data Integration Tests', () => {
  describe('Data Flow Tests with Real JSON Data', () => {
    it('should process real sales data from JSON to entity', () => {
      // Шаг 1: JSON данные (как приходят из API)
      const apiResponse = salesData;
      
      // Шаг 2: Создание entity из API response
      const salesSummary = SalesSummary.fromApiResponse(apiResponse);
      
      // Шаг 3: Проверка корректности преобразования
      expect(salesSummary).toBeInstanceOf(SalesSummary);
      expect(salesSummary.totalSales).toBe(125430);
      expect(salesSummary.transactions).toBe(1247);
      expect(salesSummary.arpu).toBeCloseTo(100.58, 2);
      expect(salesSummary.currency).toBe('USD');
      expect(salesSummary.trend).toHaveLength(8);
      expect(salesSummary.trend[0].timestamp).toBeInstanceOf(Date);
      expect(salesSummary.trend[0].value).toBe(14230);
    });

    it('should validate complete data flow from JSON to business logic', () => {
      // Полный цикл: JSON -> Entity -> Business Logic -> Results
      
      // 1. Исходные JSON данные
      const apiResponse = salesData;
      
      // 2. Преобразование в domain entity
      const salesSummary = SalesSummary.fromApiResponse(apiResponse);
      
      // 3. Применение бизнес-логики
      const trendValues = salesSummary.trend.map(point => point.value);
      const maxTrendValue = Math.max(...trendValues);
      const minTrendValue = Math.min(...trendValues);
      const averageTrendValue = trendValues.reduce((sum, value) => sum + value, 0) / trendValues.length;
      const trendGrowth = ((salesSummary.trend[salesSummary.trend.length - 1].value - salesSummary.trend[0].value) / salesSummary.trend[0].value) * 100;
      
      // 4. Проверка результатов
      expect(maxTrendValue).toBe(23240);
      expect(minTrendValue).toBe(14230);
      expect(averageTrendValue).toBeCloseTo(18428.75, 0);
      expect(trendGrowth).toBeCloseTo(63.3, 1); // Рост на 63.3%
    });

    it('should handle data transformations in the flow', () => {
      const salesSummary = SalesSummary.fromApiResponse(salesData);
      
      // Преобразования данных для UI компонентов
      const kpiData = {
        totalSales: {
          value: salesSummary.totalSales,
          formatted: `${salesSummary.totalSales.toLocaleString('en-US')} ${salesSummary.currency}`,
          growth: '+12.5%' // Пример роста
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
      
      // Преобразования для графика
      const chartData = salesSummary.trend.map(point => ({
        x: point.timestamp.getTime(),
        y: point.value,
        label: point.timestamp.toLocaleDateString()
      }));
      
      // Преобразования для аналитики
      const analyticsData = {
        trendAnalysis: {
          peak: Math.max(...salesSummary.trend.map(p => p.value)),
          valley: Math.min(...salesSummary.trend.map(p => p.value)),
          volatility: calculateVolatility(salesSummary.trend.map(p => p.value)),
          momentum: calculateMomentum(salesSummary.trend.map(p => p.value))
        },
        performanceMetrics: {
          totalRevenue: salesSummary.totalSales,
          averageDailySales: salesSummary.trend.reduce((sum, p) => sum + p.value, 0) / salesSummary.trend.length,
          revenuePerTransaction: salesSummary.totalSales / salesSummary.transactions
        }
      };
      
      // Проверка корректности преобразований
      expect(kpiData.totalSales.formatted).toBe('125,430 USD');
      expect(kpiData.transactions.formatted).toBe('1,247');
      expect(kpiData.arpu.formatted).toBe('USD 100.58');
      
      expect(chartData).toHaveLength(8);
      expect(chartData[0].y).toBe(14230);
      expect(chartData[7].y).toBe(23240);
      
      expect(analyticsData.trendAnalysis.peak).toBe(23240);
      expect(analyticsData.trendAnalysis.valley).toBe(14230);
      expect(analyticsData.performanceMetrics.averageDailySales).toBeCloseTo(18428.75, 0);
    });
  });

  describe('Error Handling in Data Flow', () => {
    it('should handle malformed JSON data gracefully', () => {
      const malformedData = {
        metrics: { // Wrong property name
          total: 125430 // Wrong structure
        }
      };
      
      // SalesSummary.fromApiResponse не валидирует, поэтому может выбросить ошибку
      expect(() => SalesSummary.fromApiResponse(malformedData)).toThrow();
    });

    it('should handle empty data in the flow', () => {
      const emptyData = {
        kpi: {
          totalSales: 0,
          transactions: 0,
          arpu: 0,
          currency: "USD"
        },
        trend: []
      };
      
      const salesSummary = SalesSummary.fromApiResponse(emptyData);
      
      expect(salesSummary.totalSales).toBe(0);
      expect(salesSummary.transactions).toBe(0);
      expect(salesSummary.trend).toHaveLength(0);
      
      // Проверяем, что бизнес-логика работает с пустыми данными
      const trendValues = salesSummary.trend.map(point => point.value);
      expect(trendValues).toHaveLength(0);
    });

    it('should handle data with missing properties', () => {
      const incompleteData = {
        kpi: {
          totalSales: 125430,
          transactions: 1247
          // Missing arpu and currency
        },
        trend: [
          { timestamp: "2025-10-01T00:00:00Z", value: 14230 }
          // Missing some trend points
        ]
      };
      
      // SalesSummary.fromApiResponse может выбросить ошибку при отсутствии обязательных полей
      expect(() => SalesSummary.fromApiResponse(incompleteData)).not.toThrow();
    });
  });

  describe('Performance Tests in Data Flow', () => {
    it('should handle large datasets efficiently', () => {
      // Создаем большой набор данных
      const largeDataset = {
        kpi: {
          totalSales: 125430,
          transactions: 1247,
          arpu: 100.58,
          currency: "USD"
        },
        trend: Array.from({ length: 1000 }, (_, index) => ({
          timestamp: new Date(Date.now() - (1000 - index) * 86400000).toISOString(),
          value: Math.random() * 50000
        }))
      };
      
      const startTime = Date.now();
      const salesSummary = SalesSummary.fromApiResponse(largeDataset);
      
      // Применяем бизнес-логику
      const trendValues = salesSummary.trend.map(point => point.value);
      const maxTrendValue = Math.max(...trendValues);
      const averageTrendValue = trendValues.reduce((sum, value) => sum + value, 0) / trendValues.length;
      
      const endTime = Date.now();
      
      // Проверяем производительность
      expect(endTime - startTime).toBeLessThan(100); // Должно быть быстро
      expect(salesSummary.trend).toHaveLength(1000);
      expect(typeof maxTrendValue).toBe('number');
      expect(typeof averageTrendValue).toBe('number');
    });

    it('should handle concurrent data processing', () => {
      const datasets = [
        salesData,
        {
          kpi: { totalSales: 50000, transactions: 500, arpu: 100, currency: "USD" },
          trend: [{ timestamp: "2025-10-01T00:00:00Z", value: 5000 }]
        },
        {
          kpi: { totalSales: 75000, transactions: 750, arpu: 100, currency: "EUR" },
          trend: [{ timestamp: "2025-10-01T00:00:00Z", value: 7500 }]
        }
      ];
      
      const startTime = Date.now();
      
      // Обрабатываем несколько наборов данных параллельно
      const results = datasets.map(data => {
        const summary = SalesSummary.fromApiResponse(data);
        const totalTrendValue = summary.trend.reduce((sum, point) => sum + point.value, 0);
        return { summary, totalTrendValue };
      });
      
      const endTime = Date.now();
      
      // Проверяем результаты
      expect(endTime - startTime).toBeLessThan(50); // Должно быть быстро
      expect(results).toHaveLength(3);
      expect(results[0].summary.totalSales).toBe(125430);
      expect(results[1].summary.totalSales).toBe(50000);
      expect(results[2].summary.totalSales).toBe(75000);
    });
  });

  describe('Integration with Real Business Scenarios', () => {
    it('should simulate real dashboard data flow', () => {
      // Симулируем реальный сценарий: загрузка данных для дашборда
      
      // 1. Данные приходят с API
      const apiResponse = salesData;
      
      // 2. Создание domain entity
      const salesSummary = SalesSummary.fromApiResponse(apiResponse);
      
      // 3. Подготовка данных для UI компонентов
      const kpiCards = [
        {
          title: 'Total Sales',
          value: salesSummary.totalSales,
          formatted: `${salesSummary.totalSales.toLocaleString('en-US')} ${salesSummary.currency}`,
          trend: '+12.5%'
        },
        {
          title: 'Transactions',
          value: salesSummary.transactions,
          formatted: salesSummary.transactions.toLocaleString('en-US'),
          trend: '+8.3%'
        },
        {
          title: 'ARPU',
          value: salesSummary.arpu,
          formatted: `${salesSummary.currency} ${salesSummary.arpu.toFixed(2)}`,
          trend: '+5.1%'
        }
      ];
      
      const chartData = salesSummary.trend.map(point => ({
        x: point.timestamp.getTime(),
        y: point.value,
        label: point.timestamp.toLocaleDateString()
      }));
      
      // 4. Проверка готовности данных для UI
      expect(kpiCards).toHaveLength(3);
      expect(kpiCards[0].formatted).toBe('125,430 USD');
      expect(kpiCards[1].formatted).toBe('1,247');
      expect(kpiCards[2].formatted).toBe('USD 100.58');
      
      expect(chartData).toHaveLength(8);
      expect(chartData[0].y).toBe(14230);
      expect(chartData[7].y).toBe(23240);
    });

    it('should handle real-time data updates flow', () => {
      // Симулируем обновление данных в реальном времени
      
      // Начальные данные
      const initialData = salesData;
      let salesSummary = SalesSummary.fromApiResponse(initialData);
      
      // Проверяем начальное состояние
      expect(salesSummary.totalSales).toBe(125430);
      expect(salesSummary.trend).toHaveLength(8);
      
      // Обновленные данные (симулируем добавление нового дня)
      const updatedData = {
        ...salesData,
        kpi: {
          ...salesData.kpi,
          totalSales: 150000 // Увеличение продаж
        },
        trend: [
          ...salesData.trend,
          {
            timestamp: "2025-10-09T00:00:00Z",
            value: 25000
          }
        ]
      };
      
      // Применяем обновления
      salesSummary = SalesSummary.fromApiResponse(updatedData);
      
      // Проверяем, что данные обновились
      expect(salesSummary.totalSales).toBe(150000);
      expect(salesSummary.trend).toHaveLength(9);
      expect(salesSummary.trend[8].value).toBe(25000);
      
      // Проверяем, что бизнес-логика работает с обновленными данными
      const totalTrendValue = salesSummary.trend.reduce((sum, point) => sum + point.value, 0);
      expect(totalTrendValue).toBeCloseTo(172430, 0); // 147430 + 25000
    });

    it('should handle data filtering and analysis scenarios', () => {
      const salesSummary = SalesSummary.fromApiResponse(salesData);
      
      // Симулируем анализ трендов
      const trendAnalysis = {
        peak: Math.max(...salesSummary.trend.map(p => p.value)),
        valley: Math.min(...salesSummary.trend.map(p => p.value)),
        growth: ((salesSummary.trend[salesSummary.trend.length - 1].value - salesSummary.trend[0].value) / salesSummary.trend[0].value) * 100,
        volatility: calculateVolatility(salesSummary.trend.map(p => p.value))
      };
      
      // Симулируем фильтрацию по периодам
      const lastWeek = salesSummary.trend.slice(-7); // Последние 7 дней
      const firstWeek = salesSummary.trend.slice(0, 7); // Первые 7 дней
      
      // Симулируем сравнение периодов
      const lastWeekAverage = lastWeek.reduce((sum, p) => sum + p.value, 0) / lastWeek.length;
      const firstWeekAverage = firstWeek.reduce((sum, p) => sum + p.value, 0) / firstWeek.length;
      
      // Проверяем результаты анализа
      expect(trendAnalysis.peak).toBe(23240);
      expect(trendAnalysis.valley).toBe(14230);
      expect(trendAnalysis.growth).toBeCloseTo(63.3, 1);
      
      expect(lastWeekAverage).toBeCloseTo(19028.57, 0);
      expect(firstWeekAverage).toBeCloseTo(17741.43, 0);
    });
  });

  describe('Data Validation and Quality Tests', () => {
    it('should validate data quality in the flow', () => {
      const salesSummary = SalesSummary.fromApiResponse(salesData);
      
      // Проверяем качество данных
      const validationResults = {
        hasValidKPI: typeof salesSummary.totalSales === 'number' && salesSummary.totalSales > 0,
        hasValidTransactions: typeof salesSummary.transactions === 'number' && salesSummary.transactions > 0,
        hasValidARPU: typeof salesSummary.arpu === 'number' && salesSummary.arpu > 0,
        hasValidCurrency: typeof salesSummary.currency === 'string' && salesSummary.currency.length > 0,
        hasValidTrend: Array.isArray(salesSummary.trend) && salesSummary.trend.length > 0,
        hasValidTrendPoints: salesSummary.trend.every(point => 
          point.timestamp instanceof Date && 
          typeof point.value === 'number' && 
          point.value >= 0
        )
      };
      
      expect(validationResults.hasValidKPI).toBe(true);
      expect(validationResults.hasValidTransactions).toBe(true);
      expect(validationResults.hasValidARPU).toBe(true);
      expect(validationResults.hasValidCurrency).toBe(true);
      expect(validationResults.hasValidTrend).toBe(true);
      expect(validationResults.hasValidTrendPoints).toBe(true);
    });

    it('should detect data anomalies', () => {
      const anomalousData = {
        kpi: {
          totalSales: -1000, // Отрицательные продажи
          transactions: 0, // Нет транзакций
          arpu: 100.58,
          currency: "USD"
        },
        trend: [
          { timestamp: "2025-10-01T00:00:00Z", value: 14230 },
          { timestamp: "2025-10-02T00:00:00Z", value: -5000 }, // Отрицательное значение
          { timestamp: "invalid-date", value: 17640 }, // Неверная дата
          { timestamp: "2025-10-04T00:00:00Z", value: 16540 }
        ]
      };
      
      const salesSummary = SalesSummary.fromApiResponse(anomalousData);
      
      // Проверяем обнаружение аномалий
      const negativeValues = salesSummary.trend.filter(point => point.value < 0);
      const invalidDates = salesSummary.trend.filter(point => isNaN(point.timestamp.getTime()));
      
      expect(negativeValues).toHaveLength(1);
      expect(negativeValues[0].value).toBe(-5000);
      expect(invalidDates).toHaveLength(1);
      expect(salesSummary.totalSales).toBe(-1000);
    });
  });
});

// Вспомогательные функции для расчетов
function calculateVolatility(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateMomentum(values: number[]): number {
  if (values.length < 2) return 0;
  const recent = values.slice(-3).reduce((sum, value) => sum + value, 0) / 3;
  const older = values.slice(0, 3).reduce((sum, value) => sum + value, 0) / 3;
  return ((recent - older) / older) * 100;
}
