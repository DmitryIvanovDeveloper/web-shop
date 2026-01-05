import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';

/**
 * TextDirection Value Object
 * Represents text direction for languages (LTR or RTL)
 */
export class TextDirection {
  public static readonly LTR = new TextDirection('ltr');
  public static readonly RTL = new TextDirection('rtl');

  private constructor(private readonly _value: 'ltr' | 'rtl') {}

  public get value(): 'ltr' | 'rtl' {
    return this._value;
  }

  public static create(value: string): TextDirection {
    const normalized = value.toLowerCase().trim();

    switch (normalized) {
      case 'ltr':
        return TextDirection.LTR;
      case 'rtl':
        return TextDirection.RTL;
      default:
        throw new InvalidArgumentError(`Invalid text direction: ${value}. Must be 'ltr' or 'rtl'`);
    }
  }

  public static fromString(value: string): TextDirection {
    return TextDirection.create(value);
  }

  public isRTL(): boolean {
    return this._value === 'rtl';
  }

  public isLTR(): boolean {
    return this._value === 'ltr';
  }

  public equals(other: TextDirection): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
