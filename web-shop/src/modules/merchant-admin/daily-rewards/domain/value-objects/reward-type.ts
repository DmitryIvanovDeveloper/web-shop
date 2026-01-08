export type RewardTypeValue = 'points' | 'currency' | 'item';

export class RewardType {
  private constructor(private readonly _value: RewardTypeValue) {}

  static create(value: string): RewardType {
    const validTypes: RewardTypeValue[] = ['points', 'currency', 'item'];
    if (!validTypes.includes(value as RewardTypeValue)) {
      throw new Error(`Invalid reward type: ${value}. Must be one of: ${validTypes.join(', ')}`);
    }
    return new RewardType(value as RewardTypeValue);
  }

  static fromString(value: string): RewardType {
    return new RewardType(value as RewardTypeValue);
  }

  get value(): RewardTypeValue {
    return this._value;
  }

  equals(other: RewardType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}





