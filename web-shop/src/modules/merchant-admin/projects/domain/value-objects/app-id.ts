import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export class AppId {
  private constructor(private readonly _value: string) {}

  static create(value: string): AppId {
    if (!value || typeof value !== 'string') {
      throw new InvalidArgumentError('AppId cannot be empty');
    }

    if (value.trim().length === 0) {
      throw new InvalidArgumentError('AppId cannot be empty or whitespace');
    }

    // Validate format - alphanumeric with underscores and hyphens
    const appIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!appIdRegex.test(value)) {
      throw new InvalidArgumentError('AppId must contain only letters, numbers, underscores and hyphens');
    }

    return new AppId(value.toUpperCase());
  }

  static fromString(value: string): AppId {
    return new AppId(value.toUpperCase());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: AppId): boolean {
    return this._value === other._value;
  }
}