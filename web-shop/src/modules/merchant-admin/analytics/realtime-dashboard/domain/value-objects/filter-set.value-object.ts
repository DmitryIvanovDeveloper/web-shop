import { Result } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';
import { DateRangeFilter } from './date-range-filter.value-object';
import { GeoFilter } from './geo-filter.value-object';
import { PaymentFilter } from './payment-filter.value-object';
import { SourceFilter } from './source-filter.value-object';
import { CurrencyFilter } from './currency-filter.value-object';

export interface FilterSetProps {
  dateRange: DateRangeFilter;
  geo?: GeoFilter;
  payment?: PaymentFilter;
  source?: SourceFilter;
  currency?: CurrencyFilter;
}

export class FilterSet {
  private constructor(
    public readonly dateRange: DateRangeFilter,
    public readonly geo: GeoFilter,
    public readonly payment: PaymentFilter,
    public readonly source: SourceFilter,
    public readonly currency: CurrencyFilter
  ) {}

  public static create(props: FilterSetProps): Result<FilterSet, InvalidArgumentError> {
    if (!props.dateRange) {
      return Result.error(new InvalidArgumentError('Date range filter is required'));
    }

    return Result.ok(
      new FilterSet(
        props.dateRange,
        props.geo || GeoFilter.createEmpty(),
        props.payment || PaymentFilter.createEmpty(),
        props.source || SourceFilter.createEmpty(),
        props.currency || CurrencyFilter.createDefault()
      )
    );
  }

  public static createDefault(): FilterSet {
    const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
    if (dateRangeResult.isFailure) {
      throw new Error('Failed to create default date range');
    }

    return new FilterSet(
      dateRangeResult.value!,
      GeoFilter.createEmpty(),
      PaymentFilter.createEmpty(),
      SourceFilter.createEmpty(),
      CurrencyFilter.createDefault()
    );
  }

  public toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {
      ...this.dateRange.toQueryParams(),
    };

    if (!this.geo.isEmpty()) {
      params.geo = this.geo.toQueryParam();
    }

    if (!this.payment.isEmpty()) {
      params.payment = this.payment.toQueryParam();
    }

    if (!this.source.isEmpty()) {
      params.source = this.source.toQueryParam();
    }

    params.currency = this.currency.toQueryParam();

    return params;
  }

  public static fromQueryParams(params: Record<string, string>): Result<FilterSet, InvalidArgumentError> {
    const dateRangeResult = params.dateRange
      ? DateRangeFilter.fromQueryParams(params)
      : DateRangeFilter.fromPreset('last7days', 'day');

    if (dateRangeResult.isFailure) {
      return Result.error(dateRangeResult.error!);
    }

    const geoResult = params.geo ? GeoFilter.fromQueryParam(params.geo) : Result.ok(GeoFilter.createEmpty());
    if (geoResult.isFailure) {
      return Result.error(geoResult.error!);
    }

    const paymentResult = params.payment
      ? PaymentFilter.fromQueryParam(params.payment)
      : Result.ok(PaymentFilter.createEmpty());
    if (paymentResult.isFailure) {
      return Result.error(paymentResult.error!);
    }

    const sourceResult = params.source
      ? SourceFilter.fromQueryParam(params.source)
      : Result.ok(SourceFilter.createEmpty());
    if (sourceResult.isFailure) {
      return Result.error(sourceResult.error!);
    }

    const currencyResult = params.currency
      ? CurrencyFilter.fromQueryParam(params.currency)
      : Result.ok(CurrencyFilter.createDefault());
    if (currencyResult.isFailure) {
      return Result.error(currencyResult.error!);
    }

    return FilterSet.create({
      dateRange: dateRangeResult.value!,
      geo: geoResult.value!,
      payment: paymentResult.value!,
      source: sourceResult.value!,
      currency: currencyResult.value!,
    });
  }

  public hasActiveFilters(): boolean {
    return !this.geo.isEmpty() || !this.payment.isEmpty() || !this.source.isEmpty();
  }
}

