import { Result, Success, Failure } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';

export type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';
export type DateGranularity = 'day' | 'week' | 'month';

export interface DateRangeFilterProps {
  preset: DateRangePreset;
  granularity: DateGranularity;
  from?: Date;
  to?: Date;
}

export class DateRangeFilter {
  private constructor(
    public readonly preset: DateRangePreset,
    public readonly granularity: DateGranularity,
    public readonly from?: Date,
    public readonly to?: Date
  ) {}

  public static create(props: DateRangeFilterProps): Result<DateRangeFilter, InvalidArgumentError> {
    if (props.preset === 'custom' && (!props.from || !props.to)) {
      return new Failure(new InvalidArgumentError('Custom date range requires from and to dates'));
    }

    if (props.from && props.to && props.from > props.to) {
      return new Failure(new InvalidArgumentError('From date must be before to date'));
    }

    return new Success(new DateRangeFilter(props.preset, props.granularity, props.from, props.to));
  }

  public static fromPreset(preset: DateRangePreset, granularity: DateGranularity = 'day'): Result<DateRangeFilter, InvalidArgumentError> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let from: Date;
    let to: Date = today;

    switch (preset) {
      case 'today':
        from = today;
        break;
      case 'yesterday':
        from = new Date(today);
        from.setDate(from.getDate() - 1);
        to = new Date(from);
        break;
      case 'last7days':
        from = new Date(today);
        from.setDate(from.getDate() - 6);
        break;
      case 'last30days':
        from = new Date(today);
        from.setDate(from.getDate() - 29);
        break;
      case 'custom':
        return new Failure(new InvalidArgumentError('Custom preset requires explicit from and to dates'));
      default:
        return new Failure(new InvalidArgumentError(`Unknown preset: ${preset}`));
    }

    return new Success(new DateRangeFilter(preset, granularity, from, to));
  }

  public toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {
      dateRange: this.preset,
      granularity: this.granularity,
    };

    if (this.preset === 'custom' && this.from && this.to) {
      params.from = this.from.toISOString().split('T')[0];
      params.to = this.to.toISOString().split('T')[0];
    }

    return params;
  }

  public static fromQueryParams(params: Record<string, string>): Result<DateRangeFilter, InvalidArgumentError> {
    const preset = params.dateRange as DateRangePreset;
    const granularity = (params.granularity as DateGranularity) || 'day';

    if (!preset) {
      return new Failure(new InvalidArgumentError('Missing dateRange parameter'));
    }

    if (preset === 'custom') {
      if (!params.from || !params.to) {
        return new Failure(new InvalidArgumentError('Custom date range requires from and to parameters'));
      }

      const from = new Date(params.from);
      const to = new Date(params.to);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return new Failure(new InvalidArgumentError('Invalid date format'));
      }

      return DateRangeFilter.create({ preset, granularity, from, to });
    }

    return DateRangeFilter.fromPreset(preset, granularity);
  }
}

