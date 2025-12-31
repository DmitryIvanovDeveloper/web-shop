export class ClaimId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ClaimId {
    if (!value || value.trim().length === 0) {
      throw new Error('Claim ID cannot be empty');
    }
    return new ClaimId(value.trim());
  }

  static fromString(value: string): ClaimId {
    return new ClaimId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ClaimId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}




