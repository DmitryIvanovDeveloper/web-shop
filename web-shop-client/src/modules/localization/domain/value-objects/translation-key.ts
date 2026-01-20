import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';


export class TranslationKey {
  private constructor(private readonly _value: string) {}

  public get value(): string {
    return this._value;
  }

  public static create(value: string): TranslationKey {
    if (!TranslationKey.isValid(value)) {
      throw new InvalidArgumentError(`Invalid translation key: ${value}`);
    }
    return new TranslationKey(value);
  }

  public static fromString(value: string): TranslationKey {
    return TranslationKey.create(value);
  }

  private static isValid(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > 255) {
      return false;
    }

            return /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(trimmed);
  }

  public getModule(): string {
    const parts = this._value.split('.');
    return parts[0] || '';
  }

  public getKey(): string {
    const parts = this._value.split('.');
    return parts.slice(1).join('.') || this._value;
  }

  public equals(other: TranslationKey): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
