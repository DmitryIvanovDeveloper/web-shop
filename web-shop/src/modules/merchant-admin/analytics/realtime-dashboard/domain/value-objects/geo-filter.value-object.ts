import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';

export interface GeoFilterProps {
  countries: string[]; 
}

export class GeoFilter {
  private constructor(public readonly countries: string[]) {}

  public static create(props: GeoFilterProps): Result<GeoFilter, InvalidArgumentError> {
    if (!props.countries || props.countries.length === 0) {
      return new Failure(new InvalidArgumentError('At least one country must be selected'));
    }

    const invalidCodes = props.countries.filter((code) => code.length !== 2);
    if (invalidCodes.length > 0) {
      return new Failure(new InvalidArgumentError(`Invalid country codes: ${invalidCodes.join(', ')}`));
    }

    return new Success(new GeoFilter(props.countries));
  }

  public static createEmpty(): GeoFilter {
    return new GeoFilter([]);
  }

  public isEmpty(): boolean {
    return this.countries.length === 0;
  }

  public includes(countryCode: string): boolean {
    return this.countries.includes(countryCode);
  }

  public toQueryParam(): string {
    return this.countries.join(',');
  }

  public static fromQueryParam(param: string): Result<GeoFilter, InvalidArgumentError> {
    if (!param || param.trim() === '') {
      return new Success(GeoFilter.createEmpty());
    }

    const countries = param.split(',').map((code) => code.trim().toUpperCase());
    return GeoFilter.create({ countries });
  }
}

