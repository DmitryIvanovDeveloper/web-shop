import { injectable } from 'inversify';
import { MetricTrend, TrendDataPoint } from '../../domain';

export interface ITrendCalculationService {
  generateTrendData(
    dataPoints: Array<{ date: string | Date; value: number }>,
    period: { startDate: Date; endDate: Date }
  ): MetricTrend;

  calculateTrendDirection(dataPoints: TrendDataPoint[]): 'up' | 'down' | 'neutral';

  calculateTrendStrength(dataPoints: TrendDataPoint[]): number;

  getOptimalDataPointsCount(totalPoints: number): number;
}

@injectable()
export class TrendCalculationService implements ITrendCalculationService {
  public generateTrendData(
    dataPoints: Array<{ date: string | Date; value: number }>,
    period: { startDate: Date; endDate: Date }
  ): MetricTrend {
    // Фильтруем точки данных по периоду
    const filteredPoints = dataPoints.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= period.startDate && pointDate <= period.endDate;
    });

    // Сортируем по дате
    const sortedPoints = filteredPoints.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Если точек слишком много, выбираем оптимальное количество
    const optimalCount = this.getOptimalDataPointsCount(sortedPoints.length);
    const selectedPoints = optimalCount < sortedPoints.length
      ? this.selectOptimalPoints(sortedPoints, optimalCount)
      : sortedPoints;

    // Преобразуем в формат TrendDataPoint
    const trendPoints: TrendDataPoint[] = selectedPoints.map(point => ({
      date: new Date(point.date).toISOString().split('T')[0],
      value: point.value
    }));

    return MetricTrend.create(trendPoints);
  }

  public calculateTrendDirection(dataPoints: TrendDataPoint[]): 'up' | 'down' | 'neutral' {
    if (dataPoints.length < 2) {
      return 'neutral';
    }

    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;

    if (lastValue > firstValue) return 'up';
    if (lastValue < firstValue) return 'down';
    return 'neutral';
  }

  public calculateTrendStrength(dataPoints: TrendDataPoint[]): number {
    if (dataPoints.length < 2) {
      return 0;
    }

    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;

    if (firstValue === 0) {
      return lastValue === 0 ? 0 : 100;
    }

    return Math.abs((lastValue - firstValue) / firstValue) * 100;
  }

  public getOptimalDataPointsCount(totalPoints: number): number {
    // Оптимальное количество точек для отображения тренда
    if (totalPoints <= 7) return totalPoints;
    if (totalPoints <= 14) return 7;
    if (totalPoints <= 30) return 10;
    return 14; // Максимум для читаемости
  }

  private selectOptimalPoints(points: Array<{ date: string | Date; value: number }>, count: number): Array<{ date: string | Date; value: number }> {
    if (points.length <= count) {
      return points;
    }

    const step = Math.floor(points.length / count);
    const selected: Array<{ date: string | Date; value: number }> = [];

    for (let i = 0; i < points.length && selected.length < count; i += step) {
      selected.push(points[i]);
    }

    // Всегда включаем последнюю точку
    if (selected[selected.length - 1] !== points[points.length - 1]) {
      selected[selected.length - 1] = points[points.length - 1];
    }

    return selected;
  }
}












