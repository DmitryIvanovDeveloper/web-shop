import { TranslationKeyValidationError } from '../errors/localization.error';

export class TranslationKey {
  private constructor(private readonly _value: string) {}

  static create(key: string): TranslationKey {
    if (!key || typeof key !== 'string') {
      throw new TranslationKeyValidationError('Translation key cannot be empty');
    }

    // Validate dot-separated format (module.field.subfield)
    const keyRegex = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/;
    if (!keyRegex.test(key)) {
      throw new TranslationKeyValidationError('Translation key must be dot-separated lowercase format');
    }

    return new TranslationKey(key);
  }

  static fromString(key: string): TranslationKey {
    return new TranslationKey(key);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: TranslationKey): boolean {
    return this._value === other._value;
  }

  getModule(): string {
    return this._value.split('.')[0];
  }

  getField(): string {
    const parts = this._value.split('.');
    return parts.length > 1 ? parts[1] : '';
  }
}
