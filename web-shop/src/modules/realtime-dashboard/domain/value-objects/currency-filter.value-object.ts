import { Result, Success, Failure } from '../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD';

export interface CurrencyFilterProps {
  currency: CurrencyCode;
}

export class CurrencyFilter {
  private static readonly VALID_CURRENCIES: CurrencyCode[] = [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CNY',
    'AUD',
    'CAD',
  ];

  private constructor(public readonly currency: CurrencyCode) {}

  public static create(props: CurrencyFilterProps): Result<CurrencyFilter, InvalidArgumentError> {
    if (!props.currency) {
      return new Failure(new InvalidArgumentError('Currency is required'));
    }

    if (!CurrencyFilter.VALID_CURRENCIES.includes(props.currency)) {
      return new Failure(new InvalidArgumentError(`Invalid currency: ${props.currency}`));
    }

    return new Success(new CurrencyFilter(props.currency));
  }

  public static createDefault(): CurrencyFilter {
    return new CurrencyFilter('USD');
  }

  public toQueryParam(): string {
    return this.currency;
  }

  public static fromQueryParam(param: string): Result<CurrencyFilter, InvalidArgumentError> {
    if (!param || param.trim() === '') {
      return new Success(CurrencyFilter.createDefault());
    }

    const currency = param.trim().toUpperCase() as CurrencyCode;
    return CurrencyFilter.create({ currency });
  }
}


