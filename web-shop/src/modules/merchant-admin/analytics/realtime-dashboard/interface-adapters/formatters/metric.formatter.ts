
export class MetricFormatter {
  
  public static formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  }

  public static formatARPU(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  public static formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  public static formatNumber(value: number): string {
    return value.toLocaleString();
  }

  public static formatConversionRate(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}

