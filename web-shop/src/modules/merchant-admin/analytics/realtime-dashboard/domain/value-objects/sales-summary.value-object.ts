import { Period } from '../value-objects/period.value-object';
import { ComparisonPeriod } from '../value-objects/comparison-period.value-object';
import { MetricTrend } from '../value-objects/metric-trend.value-object';

/**
 * SalesSummary Value Object
 * Представляет агрегированные данные по продажам за определенный период.
 * Неизменяемый объект, определяемый своими значениями.
 */
export class SalesSummary {
  public readonly totalSales: number;
  public readonly transactions: number;
  public readonly period: Period;
  public readonly trend: MetricTrend;
  public readonly comparison: ComparisonPeriod;

  private constructor(
    totalSales: number,
    transactions: number,
    period: Period,
    trend: MetricTrend,
    comparison: ComparisonPeriod
  ) {
    // Инварианты домена
    if (totalSales < 0) {
      throw new Error('Total sales cannot be negative');
    }

    if (transactions < 0) {
      throw new Error('Transactions cannot be negative');
    }

    this.totalSales = totalSales;
    this.transactions = transactions;
    this.period = period;
    this.trend = trend;
    this.comparison = comparison;
  }

  public static create(
    totalSales: number,
    transactions: number,
    period: Period,
    trendDataPoints: Array<{ date: string; value: number }>,
    previousPeriod: Period,
    previousTotalSales: number
  ): SalesSummary {
    const trend = MetricTrend.create(trendDataPoints);
    const comparison = ComparisonPeriod.create(
      period,
      previousPeriod,
      totalSales,
      previousTotalSales
    );

    return new SalesSummary(totalSales, transactions, period, trend, comparison);
  }

  /**
   * Value Object equality по значению
   */
  public equals(other: SalesSummary): boolean {
    return this.totalSales === other.totalSales &&
           this.transactions === other.transactions &&
           this.period.isEqual(other.period);
  }

  /**
   * Получить рост продаж в процентах
   * Доменная бизнес-логика
   */
  public getGrowthRate(): number {
    return this.comparison.changePercent;
  }

  /**
   * Проверить, растут ли продажи
   * Доменное бизнес-правило
   */
  public isGrowing(): boolean {
    return this.comparison.isPositive();
  }

  /**
   * Проверить критический рост/падение (>20%)
   * Доменное бизнес-правило
   */
  public isCriticalChange(): boolean {
    return Math.abs(this.comparison.changePercent) > 20;
  }
}
