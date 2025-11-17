/**
 * MetricFormatter
 * Сервис для форматирования метрик в презентационный формат.
 * Разделяет доменную логику от презентационной (Clean Architecture).
 */
export class MetricFormatter {
  /**
   * Форматирует денежную сумму в краткий формат
   * $1,234,567 -> $1.2M
   * $12,345 -> $12.3K
   * $123 -> $123
   */
  public static formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  }

  /**
   * Форматирует ARPU/ARPPU с точностью до центов
   */
  public static formatARPU(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  /**
   * Форматирует процент с знаком
   * 15.5 -> +15.5%
   * -5.2 -> -5.2%
   */
  public static formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  /**
   * Форматирует целое число с разделителями тысяч
   * 1234567 -> 1,234,567
   */
  public static formatNumber(value: number): string {
    return value.toLocaleString();
  }

  /**
   * Форматирует conversion rate
   * 0.0342 -> 3.4%
   */
  public static formatConversionRate(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}






































