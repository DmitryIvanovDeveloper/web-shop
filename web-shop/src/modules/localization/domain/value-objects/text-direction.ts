export type TextDirectionType = 'ltr' | 'rtl';

export class TextDirection {
  private constructor(private readonly _value: TextDirectionType) {}

  static LTR = new TextDirection('ltr');
  static RTL = new TextDirection('rtl');

  static fromString(direction: string): TextDirection {
    if (direction === 'rtl') return TextDirection.RTL;
    return TextDirection.LTR;
  }

  get value(): TextDirectionType {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  isRTL(): boolean {
    return this._value === 'rtl';
  }

  isLTR(): boolean {
    return this._value === 'ltr';
  }
}


