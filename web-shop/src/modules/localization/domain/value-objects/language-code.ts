import { LanguageCodeValidationError } from '../errors/localization.error';

export class LanguageCode {
  private constructor(private readonly _value: string) {}

  static create(code: string): LanguageCode {
    if (!code || typeof code !== 'string') {
      throw new LanguageCodeValidationError('Language code cannot be empty');
    }

    // Validate ISO 639-1 format (2 letters)
    const isoRegex = /^[a-z]{2}$/;
    if (!isoRegex.test(code.toLowerCase())) {
      throw new LanguageCodeValidationError('Language code must be ISO 639-1 format (2 lowercase letters)');
    }

    return new LanguageCode(code.toLowerCase());
  }

  static fromString(code: string): LanguageCode {
    return new LanguageCode(code.toLowerCase());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: LanguageCode): boolean {
    return this._value === other._value;
  }

  isRTL(): boolean {
    // Right-to-left languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi'];
    return rtlLanguages.includes(this._value);
  }
}
