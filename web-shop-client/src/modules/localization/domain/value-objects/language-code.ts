import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';


export class LanguageCode {
  private constructor(private readonly _value: string) {}

  public get value(): string {
    return this._value;
  }

  public static create(value: string): LanguageCode {
    if (!LanguageCode.isValid(value)) {
      throw new InvalidArgumentError(`Invalid language code: ${value}`);
    }
    return new LanguageCode(value.toLowerCase());
  }

  public static fromString(value: string): LanguageCode {
    return LanguageCode.create(value);
  }

  private static isValid(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

        const normalized = value.toLowerCase().trim();
    return /^[a-z]{2,3}$/.test(normalized);
  }

  public equals(other: LanguageCode): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
