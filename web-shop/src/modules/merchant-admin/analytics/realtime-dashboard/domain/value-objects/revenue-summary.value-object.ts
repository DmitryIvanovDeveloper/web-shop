import { Period } from '../value-objects/period.value-object';
import { ComparisonPeriod } from '../value-objects/comparison-period.value-object';
import { MetricTrend } from '../value-objects/metric-trend.value-object';

export class RevenueSummary {
  public readonly totalRevenue: number;
  public readonly arpu: number; 
  public readonly arppu: number; 
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
    
    if (totalRevenue < 0) {
      throw new Error('Total revenue cannot be negative');
    }

    if (arpu < 0) {
      throw new Error('ARPU cannot be negative');
    }

    if (arppu < 0) {
      throw new Error('ARPPU cannot be negative');
    }

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

  public equals(other: RevenueSummary): boolean {
    return this.totalRevenue === other.totalRevenue &&
           this.arpu === other.arpu &&
           this.arppu === other.arppu &&
           this.period.isEqual(other.period);
  }

  public getGrowthRate(): number {
    return this.comparison.changePercent;
  }

  public isGrowing(): boolean {
    return this.comparison.isPositive();
  }

  public isCriticalChange(): boolean {
    return Math.abs(this.comparison.changePercent) > 20;
  }

  public getPayingUserRatio(): number {
    if (this.arppu === 0 || this.arpu === 0) {
      return 0;
    }
    return (this.arpu / this.arppu) * 100; 
  }

  public hasHealthyMonetization(): boolean {
    return this.arppu >= this.arpu * 2;
  }
}
