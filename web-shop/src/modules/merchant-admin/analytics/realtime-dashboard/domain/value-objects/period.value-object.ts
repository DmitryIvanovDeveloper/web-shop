import { Result } from '../../../../../../shared/domain/result/result';

export type GranularityType = 'day' | 'week' | 'month';
export type PeriodPreset = 'today' | 'last7days' | 'last30days' | 'custom';

export class Period {
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly granularity: GranularityType;
  public readonly preset?: PeriodPreset;

  private constructor(
    startDate: Date,
    endDate: Date,
    granularity: GranularityType,
    preset?: PeriodPreset
  ) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.granularity = granularity;
    this.preset = preset;
  }

  public static create(
    startDate: Date,
    endDate: Date,
    granularity: GranularityType = 'day'
  ): Result<Period, Error> {
    if (startDate >= endDate) {
      return Result.error(new Error('Start date must be before end date'));
    }

    if (granularity !== 'day' && granularity !== 'week' && granularity !== 'month') {
      return Result.error(new Error('Invalid granularity type'));
    }

    return Result.ok(new Period(startDate, endDate, granularity));
  }

  public static fromPreset(preset: PeriodPreset): Period {
    const now = new Date();
    let startDate: Date;
    let granularity: GranularityType = 'day';

    switch (preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        granularity = 'day';
        break;
      default:
        throw new Error(`Unsupported preset: ${preset}`);
    }

    return new Period(startDate, now, granularity, preset);
  }

  public toString(): string {
    return `${this.startDate.toISOString()}/${this.endDate.toISOString()}`;
  }

  public getDurationInDays(): number {
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  public isEqual(other: Period): boolean {
    return this.startDate.getTime() === other.startDate.getTime() &&
           this.endDate.getTime() === other.endDate.getTime() &&
           this.granularity === other.granularity;
  }
}
