import { Result, Success, Failure } from '../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';
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
      return new Failure(new InvalidArgumentError('Date range filter is required'));
    }

    return new Success(
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
    if (dateRangeResult.isFailure()) {
      throw new Error('Failed to create default date range');
    }

    return new FilterSet(
      dateRangeResult.data!,
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

    if (dateRangeResult.isFailure()) {
      return new Failure(dateRangeResult.error);
    }

    const geoResult = params.geo ? GeoFilter.fromQueryParam(params.geo) : new Success(GeoFilter.createEmpty());
    if (geoResult.isFailure()) {
      return new Failure(geoResult.error);
    }

    const paymentResult = params.payment
      ? PaymentFilter.fromQueryParam(params.payment)
      : new Success(PaymentFilter.createEmpty());
    if (paymentResult.isFailure()) {
      return new Failure(paymentResult.error);
    }

    const sourceResult = params.source
      ? SourceFilter.fromQueryParam(params.source)
      : new Success(SourceFilter.createEmpty());
    if (sourceResult.isFailure()) {
      return new Failure(sourceResult.error);
    }

    const currencyResult = params.currency
      ? CurrencyFilter.fromQueryParam(params.currency)
      : new Success(CurrencyFilter.createDefault());
    if (currencyResult.isFailure()) {
      return new Failure(currencyResult.error);
    }

    return FilterSet.create({
      dateRange: dateRangeResult.data!,
      geo: geoResult.data!,
      payment: paymentResult.data!,
      source: sourceResult.data!,
      currency: currencyResult.data!,
    });
  }

  public hasActiveFilters(): boolean {
    return !this.geo.isEmpty() || !this.payment.isEmpty() || !this.source.isEmpty();
  }
}

