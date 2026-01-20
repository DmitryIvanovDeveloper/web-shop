export class Version {
  private constructor(private readonly _value: string) {}

  static create(value: string): Version {
    if (!value || typeof value !== 'string') {
      throw new Error('Version cannot be empty');
    }

        const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(value)) {
      throw new Error('Version must follow semantic versioning format (x.y.z)');
    }

    return new Version(value);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: Version): boolean {
    return this._value === other._value;
  }

    isGreaterThan(other: Version): boolean {
    const [major1, minor1, patch1] = this._value.split('.').map(Number);
    const [major2, minor2, patch2] = other._value.split('.').map(Number);

    if (major1 !== major2) return major1 > major2;
    if (minor1 !== minor2) return minor1 > minor2;
    return patch1 > patch2;
  }
}








