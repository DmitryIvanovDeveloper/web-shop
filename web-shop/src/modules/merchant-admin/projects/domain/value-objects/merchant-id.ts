import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export class MerchantId {
  private constructor(private readonly _value: string) {}

  static create(value: string): MerchantId {
    if (!value || typeof value !== 'string') {
      throw new InvalidArgumentError('MerchantId cannot be empty');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new InvalidArgumentError('MerchantId must be a valid UUID');
    }

    return new MerchantId(value);
  }

  static fromString(value: string): MerchantId {
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new InvalidArgumentError('MerchantId must be a valid UUID');
    }
    return new MerchantId(value);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: MerchantId): boolean {
    return this._value === other._value;
  }
}