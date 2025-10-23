import { Period } from '../value-objects/period.value-object';
import { ComparisonPeriod } from '../value-objects/comparison-period.value-object';
import { MetricTrend } from '../value-objects/metric-trend.value-object';

/**
 * RevenueSummary Value Object
 * Представляет агрегированные данные по доходам за определенный период.
 * Неизменяемый объект, определяемый своими значениями.
 * Инкапсулирует доменные бизнес-правила для анализа доходов.
 */
export class RevenueSummary {
  public readonly totalRevenue: number;
  public readonly arpu: number; // Average Revenue Per User
  public readonly arppu: number; // Average Revenue Per Paying User
  public readonly period: Period;
  public readonly trend: MetricTrend;
  public readonly comparison: ComparisonPeriod;

  private constructor(
    totalRevenue: number,
    arpu: number,
    arppu: number,
    period: Period,
    trend: MetricTrend,
    comparison: ComparisonPeriod
  ) {
    // Инварианты домена
    if (totalRevenue < 0) {
      throw new Error('Total revenue cannot be negative');
    }

    if (arpu < 0) {
      throw new Error('ARPU cannot be negative');
    }

    if (arppu < 0) {
      throw new Error('ARPPU cannot be negative');
    }

    // Доменное правило: ARPPU должен быть >= ARPU (платящие пользователи приносят больше)
    if (arppu < arpu && arppu !== 0) {
      throw new Error('ARPPU must be greater than or equal to ARPU');
    }

    this.totalRevenue = totalRevenue;
    this.arpu = arpu;
    this.arppu = arppu;
    this.period = period;
    this.trend = trend;
    this.comparison = comparison;
  }

  public static create(
    totalRevenue: number,
    arpu: number,
    arppu: number,
    period: Period,
    trendDataPoints: Array<{ date: string; value: number }>,
    previousPeriod: Period,
    previousRevenue: number
  ): RevenueSummary {
    const trend = MetricTrend.create(trendDataPoints);
    const comparison = ComparisonPeriod.create(
      period,
      previousPeriod,
      totalRevenue,
      previousRevenue
    );

    return new RevenueSummary(totalRevenue, arpu, arppu, period, trend, comparison);
  }

  /**
   * Value Object equality по значению
   */
  public equals(other: RevenueSummary): boolean {
    return this.totalRevenue === other.totalRevenue &&
           this.arpu === other.arpu &&
           this.arppu === other.arppu &&
           this.period.isEqual(other.period);
  }

  /**
   * Получить рост доходов в процентах
   * Доменная бизнес-логика
   */
  public getGrowthRate(): number {
    return this.comparison.changePercent;
  }

  /**
   * Проверить, растут ли доходы
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

  /**
   * Рассчитать conversion rate к платящим пользователям
   * Доменное бизнес-правило: если ARPU > 0 и ARPPU > ARPU
   */
  public getPayingUserRatio(): number {
    if (this.arppu === 0 || this.arpu === 0) {
      return 0;
    }
    return (this.arpu / this.arppu) * 100; // % платящих пользователей
  }

  /**
   * Проверить здоровье монетизации
   * Доменное правило: ARPPU должен быть минимум в 2 раза больше ARPU
   */
  public hasHealthyMonetization(): boolean {
    return this.arppu >= this.arpu * 2;
  }
}
