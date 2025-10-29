export interface TrendDataPoint {
  readonly date: string;
  readonly value: number;
}

export class MetricTrend {
  public readonly dataPoints: readonly TrendDataPoint[];
  public readonly minValue: number;
  public readonly maxValue: number;
  public readonly averageValue: number;
  public readonly isIncreasing: boolean;
  public readonly isDecreasing: boolean;

  private constructor(dataPoints: TrendDataPoint[]) {
    this.dataPoints = [...dataPoints];

    if (dataPoints.length === 0) {
      this.minValue = 0;
      this.maxValue = 0;
      this.averageValue = 0;
      this.isIncreasing = false;
      this.isDecreasing = false;
      return;
    }

    const values = dataPoints.map(point => point.value);
    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);
    this.averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Определяем тренд по первым и последним точкам
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    this.isIncreasing = lastValue > firstValue;
    this.isDecreasing = lastValue < firstValue;
  }

  public static create(dataPoints: TrendDataPoint[]): MetricTrend {
    if (!Array.isArray(dataPoints)) {
      throw new Error('Data points must be an array');
    }

    // Валидация точек данных
    for (const point of dataPoints) {
      if (!point.date || typeof point.value !== 'number' || isNaN(point.value)) {
        throw new Error('Invalid trend data point');
      }
    }

    return new MetricTrend(dataPoints);
  }

  public getDataPointsForPeriod(count: number): TrendDataPoint[] {
    if (count >= this.dataPoints.length) {
      return [...this.dataPoints];
    }

    return this.dataPoints.slice(-count);
  }

  public getFormattedValue(index: number): string {
    if (index < 0 || index >= this.dataPoints.length) {
      return 'N/A';
    }

    return this.dataPoints[index].value.toLocaleString();
  }

  public getPercentageChange(): number {
    if (this.dataPoints.length < 2) {
      return 0;
    }

    const firstValue = this.dataPoints[0].value;
    const lastValue = this.dataPoints[this.dataPoints.length - 1].value;

    if (firstValue === 0) {
      return lastValue === 0 ? 0 : 100;
    }

    return ((lastValue - firstValue) / firstValue) * 100;
  }

  public getTrendStrength(): 'strong' | 'moderate' | 'weak' | 'none' {
    const change = Math.abs(this.getPercentageChange());

    if (change >= 20) return 'strong';
    if (change >= 5) return 'moderate';
    if (change >= 0.1) return 'weak';
    return 'none';
  }

  public toJSON(): Record<string, any> {
    return {
      dataPoints: this.dataPoints,
      minValue: this.minValue,
      maxValue: this.maxValue,
      averageValue: this.averageValue,
      isIncreasing: this.isIncreasing,
      isDecreasing: this.isDecreasing,
      trendStrength: this.getTrendStrength()
    };
  }
}

















