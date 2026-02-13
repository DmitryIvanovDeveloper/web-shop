import { injectable } from 'inversify';
import { Period, ComparisonPeriod } from '../../domain';

export interface IPeriodComparisonService {
  calculateComparison(
    currentPeriod: Period,
    previousPeriod: Period,
    currentValue: number,
    previousValue: number
  ): ComparisonPeriod;

  calculatePreviousPeriod(currentPeriod: Period): Period;
}

@injectable()
export class PeriodComparisonService implements IPeriodComparisonService {
  public calculateComparison(
    currentPeriod: Period,
    previousPeriod: Period,
    currentValue: number,
    previousValue: number
  ): ComparisonPeriod {
    return ComparisonPeriod.create(currentPeriod, previousPeriod, currentValue, previousValue);
  }

  public calculatePreviousPeriod(currentPeriod: Period): Period {
    const duration = currentPeriod.getDurationInDays();
    const startDate = new Date(currentPeriod.startDate.getTime() - duration * 24 * 60 * 60 * 1000);
    const endDate = new Date(currentPeriod.endDate.getTime() - duration * 24 * 60 * 60 * 1000);

    const result = Period.create(startDate, endDate, currentPeriod.granularity);
    
    if (!result.isSuccess || !result.value) {
      throw new Error('Failed to calculate previous period');
    }

    return result.value;
  }
}

