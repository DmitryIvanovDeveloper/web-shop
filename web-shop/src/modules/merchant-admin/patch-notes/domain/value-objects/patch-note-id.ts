export class PatchNoteId {
  private constructor(private readonly _value: string) {}

  static create(): PatchNoteId {
    // Use crypto.randomUUID() if available (browser), otherwise fallback to a simple UUID v4 implementation
    let uuid: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      // Simple UUID v4 fallback for environments without crypto.randomUUID
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    return new PatchNoteId(uuid);
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
