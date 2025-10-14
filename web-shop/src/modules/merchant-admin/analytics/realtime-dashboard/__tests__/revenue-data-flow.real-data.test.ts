import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RevenueSummary } from '../domain/entities/revenue-summary.entity';
import { TrendDataPoint } from '../domain/types/trend.types';

// Реальные JSON данные (копия из public/mocks/api/revenue/summary.json)
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
    {
      "timestamp": "2025-10-01T00:00:00Z",
      "value": 28340
    },
    {
      "timestamp": "2025-10-02T00:00:00Z",
      "value": 31250
    },
    {
      "timestamp": "2025-10-03T00:00:00Z",
      "value": 34100
    },
    {
      "timestamp": "2025-10-04T00:00:00Z",
      "value": 32890
    },
    {
      "timestamp": "2025-10-05T00:00:00Z",
      "value": 36420
    },
    {
      "timestamp": "2025-10-06T00:00:00Z",
      "value": 41230
    },
    {
      "timestamp": "2025-10-07T00:00:00Z",
      "value": 38760
    },
    {
      "timestamp": "2025-10-08T00:00:00Z",
      "value": 44690
    }
  ]
};

describe('Revenue Data Flow - Real Data Integration Tests', () => {
  describe('Data Flow Tests with Real JSON Data', () => {
    it('should process real revenue data from JSON to entity', () => {
      // Шаг 1: JSON данные (как приходят из API)
      const apiResponse = revenueData;
      
      // Шаг 2: Создание entity из API response
      const revenueSummary = RevenueSummary.fromApiResponse(apiResponse);
      
      // Шаг 3: Проверка корректности преобразования
      expect(revenueSummary).toBeInstanceOf(RevenueSummary);
      expect(revenueSummary.totalRevenue).toBe(245680);
      expect(revenueSummary.averageOrderValue).toBeCloseTo(196.95, 2);
      expect(revenueSummary.revenuePerVisitor).toBeCloseTo(4.87, 2);
      expect(revenueSummary.netIncome).toBe(98500);
      expect(revenueSummary.monthlyGrowth).toBeCloseTo(15.3, 1);
      expect(revenueSummary.currency).toBe('USD');
      expect(revenueSummary.trend).toHaveLength(8);
      expect(revenueSummary.trend[0].timestamp).toBeInstanceOf(Date);
      expect(revenueSummary.trend[0].value).toBe(28340);
    });

    it('should validate complete data flow from JSON to business logic', () => {
      // Полный цикл: JSON -> Entity -> Business Logic -> Results
      
      // 1. Исходные JSON данные
      const apiResponse = revenueData;
      
      // 2. Преобразование в domain entity
      const revenueSummary = RevenueSummary.fromApiResponse(apiResponse);
      
      // 3. Применение бизнес-логики
      const trendValues = revenueSummary.trend.map(point => point.value);
      const maxRevenue = Math.max(...trendValues);
      const minRevenue = Math.min(...trendValues);
      const averageDailyRevenue = trendValues.reduce((sum, value) => sum + value, 0) / trendValues.length;
      const revenueGrowth = ((revenueSummary.trend[revenueSummary.trend.length - 1].value - revenueSummary.trend[0].value) / revenueSummary.trend[0].value) * 100;
      const profitMargin = (revenueSummary.netIncome / revenueSummary.totalRevenue) * 100;
      
      // 4. Проверка результатов
      expect(maxRevenue).toBe(44690);
      expect(minRevenue).toBe(28340);
      expect(averageDailyRevenue).toBeCloseTo(35960, 0);
      expect(revenueGrowth).toBeCloseTo(57.7, 1); // Рост на 57.7%
      expect(profitMargin).toBeCloseTo(40.1, 1); // Маржа прибыли 40.1%
    });

    it('should handle data transformations in the flow', () => {
      const revenueSummary = RevenueSummary.fromApiResponse(revenueData);
      
      // Преобразования данных для UI компонентов
      const kpiCards = {
        totalRevenue: {
          value: revenueSummary.totalRevenue,
          formatted: `${revenueSummary.totalRevenue.toLocaleString('en-US')} ${revenueSummary.currency}`,
          growth: `+${revenueSummary.monthlyGrowth}%`
        },
        averageOrderValue: {
          value: revenueSummary.averageOrderValue,
          formatted: `${revenueSummary.currency} ${revenueSummary.averageOrderValue.toFixed(2)}`
        },
        revenuePerVisitor: {
          value: revenueSummary.revenuePerVisitor,
          formatted: `${revenueSummary.currency} ${revenueSummary.revenuePerVisitor.toFixed(2)}`
        },
        netIncome: {
          value: revenueSummary.netIncome,
          formatted: `${revenueSummary.netIncome.toLocaleString('en-US')} ${revenueSummary.currency}`,
          margin: `${((revenueSummary.netIncome / revenueSummary.totalRevenue) * 100).toFixed(1)}%`
        }
      };
      
      // Преобразования для графика
      const chartData = revenueSummary.trend.map(point => ({
        x: point.timestamp.getTime(),
        y: point.value,
        label: point.timestamp.toLocaleDateString()
      }));
      
      // Преобразования для аналитики
      const analyticsData = {
        trendAnalysis: {
          peak: Math.max(...revenueSummary.trend.map(p => p.value)),
          valley: Math.min(...revenueSummary.trend.map(p => p.value)),
          volatility: calculateVolatility(revenueSummary.trend.map(p => p.value)),
          momentum: calculateMomentum(revenueSummary.trend.map(p => p.value))
        },
        financialMetrics: {
          totalRevenue: revenueSummary.totalRevenue,
          netIncome: revenueSummary.netIncome,
          profitMargin: (revenueSummary.netIncome / revenueSummary.totalRevenue) * 100,
          averageDailyRevenue: revenueSummary.trend.reduce((sum, p) => sum + p.value, 0) / revenueSummary.trend.length,
          revenueGrowth: revenueSummary.monthlyGrowth
        }
      };
      
      // Проверка корректности преобразований
      expect(kpiCards.totalRevenue.formatted).toBe('245,680 USD');
      expect(kpiCards.averageOrderValue.formatted).toBe('USD 196.95');
      expect(kpiCards.revenuePerVisitor.formatted).toBe('USD 4.87');
      expect(kpiCards.netIncome.formatted).toBe('98,500 USD');
      expect(kpiCards.netIncome.margin).toBe('40.1%');
      
      expect(chartData).toHaveLength(8);
      expect(chartData[0].y).toBe(28340);
      expect(chartData[7].y).toBe(44690);
      
      expect(analyticsData.trendAnalysis.peak).toBe(44690);
      expect(analyticsData.trendAnalysis.valley).toBe(28340);
      expect(analyticsData.financialMetrics.profitMargin).toBeCloseTo(40.1, 1);
    });
  });

  describe('Error Handling in Data Flow', () => {
    it('should handle malformed JSON data gracefully', () => {
      const malformedData = {
        metrics: { // Wrong property name
          total: 245680 // Wrong structure
        }
      };
      
      // RevenueSummary.fromApiResponse не валидирует, поэтому может выбросить ошибку
      expect(() => RevenueSummary.fromApiResponse(malformedData)).toThrow();
    });

    it('should handle empty data in the flow', () => {
      const emptyData = {
        kpi: {
          totalRevenue: 0,
          averageOrderValue: 0,
          revenuePerVisitor: 0,
          netIncome: 0,
          monthlyGrowth: 0,
          currency: "USD"
        },
        trend: []
      };
      
      const revenueSummary = RevenueSummary.fromApiResponse(emptyData);
      
      expect(revenueSummary.totalRevenue).toBe(0);
      expect(revenueSummary.netIncome).toBe(0);
      expect(revenueSummary.trend).toHaveLength(0);
      
      // Проверяем, что бизнес-логика работает с пустыми данными
      const trendValues = revenueSummary.trend.map(point => point.value);
      expect(trendValues).toHaveLength(0);
    });

    it('should handle data with missing properties', () => {
      const incompleteData = {
        kpi: {
          totalRevenue: 245680,
          averageOrderValue: 196.95
          // Missing other required fields
        },
        trend: [
          { timestamp: "2025-10-01T00:00:00Z", value: 28340 }
        ]
      };
      
      // RevenueSummary.fromApiResponse может выбросить ошибку при отсутствии обязательных полей
      expect(() => RevenueSummary.fromApiResponse(incompleteData)).not.toThrow();
    });
  });

  describe('Performance Tests in Data Flow', () => {
    it('should handle large datasets efficiently', () => {
      // Создаем большой набор данных
      const largeDataset = {
        kpi: {
          totalRevenue: 245680,
          averageOrderValue: 196.95,
          revenuePerVisitor: 4.87,
          netIncome: 98500,
          monthlyGrowth: 15.3,
          currency: "USD"
        },
        trend: Array.from({ length: 1000 }, (_, index) => ({
          timestamp: new Date(Date.now() - (1000 - index) * 86400000).toISOString(),
          value: Math.random() * 100000
        }))
      };
      
      const startTime = Date.now();
      const revenueSummary = RevenueSummary.fromApiResponse(largeDataset);
      
      // Применяем бизнес-логику
      const trendValues = revenueSummary.trend.map(point => point.value);
      const maxRevenue = Math.max(...trendValues);
      const averageRevenue = trendValues.reduce((sum, value) => sum + value, 0) / trendValues.length;
      const profitMargin = (revenueSummary.netIncome / revenueSummary.totalRevenue) * 100;
      
      const endTime = Date.now();
      
      // Проверяем производительность
      expect(endTime - startTime).toBeLessThan(100); // Должно быть быстро
      expect(revenueSummary.trend).toHaveLength(1000);
      expect(typeof maxRevenue).toBe('number');
      expect(typeof averageRevenue).toBe('number');
      expect(typeof profitMargin).toBe('number');
    });

    it('should handle concurrent data processing', () => {
      const datasets = [
        revenueData,
        {
          kpi: { totalRevenue: 100000, averageOrderValue: 100, revenuePerVisitor: 2, netIncome: 40000, monthlyGrowth: 10, currency: "USD" },
          trend: [{ timestamp: "2025-10-01T00:00:00Z", value: 10000 }]
        },
        {
          kpi: { totalRevenue: 200000, averageOrderValue: 200, revenuePerVisitor: 4, netIncome: 80000, monthlyGrowth: 20, currency: "EUR" },
          trend: [{ timestamp: "2025-10-01T00:00:00Z", value: 20000 }]
        }
      ];
      
      const startTime = Date.now();
      
      // Обрабатываем несколько наборов данных параллельно
      const results = datasets.map(data => {
        const summary = RevenueSummary.fromApiResponse(data);
        const totalTrendValue = summary.trend.reduce((sum, point) => sum + point.value, 0);
        const profitMargin = (summary.netIncome / summary.totalRevenue) * 100;
        return { summary, totalTrendValue, profitMargin };
      });
      
      const endTime = Date.now();
      
      // Проверяем результаты
      expect(endTime - startTime).toBeLessThan(50); // Должно быть быстро
      expect(results).toHaveLength(3);
      expect(results[0].summary.totalRevenue).toBe(245680);
      expect(results[1].summary.totalRevenue).toBe(100000);
      expect(results[2].summary.totalRevenue).toBe(200000);
      expect(results[0].profitMargin).toBeCloseTo(40.1, 1);
    });
  });

  describe('Integration with Real Business Scenarios', () => {
    it('should simulate real dashboard data flow', () => {
      // Симулируем реальный сценарий: загрузка данных для дашборда
      
      // 1. Данные приходят с API
      const apiResponse = revenueData;
      
      // 2. Создание domain entity
      const revenueSummary = RevenueSummary.fromApiResponse(apiResponse);
      
      // 3. Подготовка данных для UI компонентов
      const kpiCards = [
        {
          title: 'Total Revenue',
          value: revenueSummary.totalRevenue,
          formatted: `${revenueSummary.totalRevenue.toLocaleString('en-US')} ${revenueSummary.currency}`,
          trend: `+${revenueSummary.monthlyGrowth}%`
        },
        {
          title: 'Net Income',
          value: revenueSummary.netIncome,
          formatted: `${revenueSummary.netIncome.toLocaleString('en-US')} ${revenueSummary.currency}`,
          margin: `${((revenueSummary.netIncome / revenueSummary.totalRevenue) * 100).toFixed(1)}%`
        },
        {
          title: 'Average Order Value',
          value: revenueSummary.averageOrderValue,
          formatted: `${revenueSummary.currency} ${revenueSummary.averageOrderValue.toFixed(2)}`
        },
        {
          title: 'Revenue per Visitor',
          value: revenueSummary.revenuePerVisitor,
          formatted: `${revenueSummary.currency} ${revenueSummary.revenuePerVisitor.toFixed(2)}`
        }
      ];
      
      const chartData = revenueSummary.trend.map(point => ({
        x: point.timestamp.getTime(),
        y: point.value,
        label: point.timestamp.toLocaleDateString()
      }));
      
      // 4. Проверка готовности данных для UI
      expect(kpiCards).toHaveLength(4);
      expect(kpiCards[0].formatted).toBe('245,680 USD');
      expect(kpiCards[1].formatted).toBe('98,500 USD');
      expect(kpiCards[2].formatted).toBe('USD 196.95');
      expect(kpiCards[3].formatted).toBe('USD 4.87');
      
      expect(chartData).toHaveLength(8);
      expect(chartData[0].y).toBe(28340);
      expect(chartData[7].y).toBe(44690);
    });

    it('should handle real-time data updates flow', () => {
      // Симулируем обновление данных в реальном времени
      
      // Начальные данные
      const initialData = revenueData;
      let revenueSummary = RevenueSummary.fromApiResponse(initialData);
      
      // Проверяем начальное состояние
      expect(revenueSummary.totalRevenue).toBe(245680);
      expect(revenueSummary.trend).toHaveLength(8);
      
      // Обновленные данные (симулируем увеличение доходов)
      const updatedData = {
        ...revenueData,
        kpi: {
          ...revenueData.kpi,
          totalRevenue: 300000, // Увеличение доходов
          netIncome: 120000,    // Увеличение чистой прибыли
          monthlyGrowth: 22.1   // Увеличение роста
        },
        trend: [
          ...revenueData.trend,
          {
            timestamp: "2025-10-09T00:00:00Z",
            value: 50000
          }
        ]
      };
      
      // Применяем обновления
      revenueSummary = RevenueSummary.fromApiResponse(updatedData);
      
      // Проверяем, что данные обновились
      expect(revenueSummary.totalRevenue).toBe(300000);
      expect(revenueSummary.netIncome).toBe(120000);
      expect(revenueSummary.monthlyGrowth).toBeCloseTo(22.1, 1);
      expect(revenueSummary.trend).toHaveLength(9);
      expect(revenueSummary.trend[8].value).toBe(50000);
      
      // Проверяем, что бизнес-логика работает с обновленными данными
      const newProfitMargin = (revenueSummary.netIncome / revenueSummary.totalRevenue) * 100;
      expect(newProfitMargin).toBeCloseTo(40.0, 1); // Маржа прибыли 40%
    });

    it('should handle financial analysis scenarios', () => {
      const revenueSummary = RevenueSummary.fromApiResponse(revenueData);
      
      // Симулируем финансовый анализ
      const financialAnalysis = {
        profitMargin: (revenueSummary.netIncome / revenueSummary.totalRevenue) * 100,
        revenueGrowth: revenueSummary.monthlyGrowth,
        efficiency: revenueSummary.revenuePerVisitor / revenueSummary.averageOrderValue,
        trendAnalysis: {
          peak: Math.max(...revenueSummary.trend.map(p => p.value)),
          valley: Math.min(...revenueSummary.trend.map(p => p.value)),
          growth: ((revenueSummary.trend[revenueSummary.trend.length - 1].value - revenueSummary.trend[0].value) / revenueSummary.trend[0].value) * 100
        }
      };
      
      // Симулируем сравнение с предыдущим периодом
      const currentPeriod = revenueSummary.trend.slice(-4); // Последние 4 дня
      const previousPeriod = revenueSummary.trend.slice(0, 4); // Первые 4 дня
      
      const currentPeriodAverage = currentPeriod.reduce((sum, p) => sum + p.value, 0) / currentPeriod.length;
      const previousPeriodAverage = previousPeriod.reduce((sum, p) => sum + p.value, 0) / previousPeriod.length;
      const periodGrowth = ((currentPeriodAverage - previousPeriodAverage) / previousPeriodAverage) * 100;
      
      // Проверяем результаты анализа
      expect(financialAnalysis.profitMargin).toBeCloseTo(40.1, 1);
      expect(financialAnalysis.revenueGrowth).toBeCloseTo(15.3, 1);
      expect(financialAnalysis.efficiency).toBeCloseTo(0.025, 3);
      expect(financialAnalysis.trendAnalysis.growth).toBeCloseTo(57.7, 1);
      
      expect(currentPeriodAverage).toBeCloseTo(40275, 0);
      expect(previousPeriodAverage).toBeCloseTo(31645, 0);
      expect(periodGrowth).toBeCloseTo(27.3, 1);
    });
  });

  describe('Data Validation and Quality Tests', () => {
    it('should validate data quality in the flow', () => {
      const revenueSummary = RevenueSummary.fromApiResponse(revenueData);
      
      // Проверяем качество данных
      const validationResults = {
        hasValidRevenue: typeof revenueSummary.totalRevenue === 'number' && revenueSummary.totalRevenue > 0,
        hasValidIncome: typeof revenueSummary.netIncome === 'number' && revenueSummary.netIncome >= 0,
        hasValidAOV: typeof revenueSummary.averageOrderValue === 'number' && revenueSummary.averageOrderValue > 0,
        hasValidRPV: typeof revenueSummary.revenuePerVisitor === 'number' && revenueSummary.revenuePerVisitor > 0,
        hasValidGrowth: typeof revenueSummary.monthlyGrowth === 'number',
        hasValidCurrency: typeof revenueSummary.currency === 'string' && revenueSummary.currency.length > 0,
        hasValidTrend: Array.isArray(revenueSummary.trend) && revenueSummary.trend.length > 0,
        hasValidTrendPoints: revenueSummary.trend.every(point => 
          point.timestamp instanceof Date && 
          typeof point.value === 'number' && 
          point.value >= 0
        )
      };
      
      expect(validationResults.hasValidRevenue).toBe(true);
      expect(validationResults.hasValidIncome).toBe(true);
      expect(validationResults.hasValidAOV).toBe(true);
      expect(validationResults.hasValidRPV).toBe(true);
      expect(validationResults.hasValidGrowth).toBe(true);
      expect(validationResults.hasValidCurrency).toBe(true);
      expect(validationResults.hasValidTrend).toBe(true);
      expect(validationResults.hasValidTrendPoints).toBe(true);
    });

    it('should detect data anomalies', () => {
      const anomalousData = {
        kpi: {
          totalRevenue: -50000, // Отрицательные доходы
          averageOrderValue: 0, // Нулевая средняя стоимость заказа
          revenuePerVisitor: -2.5, // Отрицательный доход на посетителя
          netIncome: 100000, // Чистая прибыль больше общих доходов
          monthlyGrowth: 15.3,
          currency: "USD"
        },
        trend: [
          { timestamp: "2025-10-01T00:00:00Z", value: 28340 },
          { timestamp: "2025-10-02T00:00:00Z", value: -10000 }, // Отрицательный доход
          { timestamp: "invalid-date", value: 34100 }, // Неверная дата
          { timestamp: "2025-10-04T00:00:00Z", value: 32890 }
        ]
      };
      
      const revenueSummary = RevenueSummary.fromApiResponse(anomalousData);
      
      // Проверяем обнаружение аномалий
      const negativeValues = revenueSummary.trend.filter(point => point.value < 0);
      const invalidDates = revenueSummary.trend.filter(point => isNaN(point.timestamp.getTime()));
      const profitExceedsRevenue = revenueSummary.netIncome > revenueSummary.totalRevenue;
      
      expect(negativeValues).toHaveLength(1);
      expect(negativeValues[0].value).toBe(-10000);
      expect(invalidDates).toHaveLength(1);
      expect(profitExceedsRevenue).toBe(true);
      expect(revenueSummary.totalRevenue).toBe(-50000);
      expect(revenueSummary.averageOrderValue).toBe(0);
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
