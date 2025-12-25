import { randomUUID } from 'crypto';

export class PatchNoteId {
  private constructor(private readonly _value: string) {}

  static create(): PatchNoteId {
    return new PatchNoteId(randomUUID());
  }

  static fromString(value: string): PatchNoteId {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid PatchNoteId: must be a non-empty string');
    }
    return new PatchNoteId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PatchNoteId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

