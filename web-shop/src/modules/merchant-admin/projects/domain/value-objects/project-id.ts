export class ProjectId {
  private constructor(private readonly _value: string) {}

  static create(): ProjectId {
    // Generate UUID v4
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return new ProjectId(uuid);
  }

  static fromString(id: string): ProjectId {
    if (!id || typeof id !== 'string') {
      throw new Error('Project ID cannot be empty');
    }

    // Basic UUID v4 validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Project ID must be a valid UUID v4');
    }

    return new ProjectId(id);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: ProjectId): boolean {
    return this._value === other._value;
  }
}
