export class RewardId {
  private constructor(private readonly _value: string) {}

  static create(value: string): RewardId {
    if (!value || value.trim().length === 0) {
      throw new Error('Reward ID cannot be empty');
    }
    return new RewardId(value.trim());
  }

  static fromString(value: string): RewardId {
    return new RewardId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: RewardId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
