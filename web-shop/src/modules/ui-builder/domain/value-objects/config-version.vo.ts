export class ConfigVersion {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static initial(): ConfigVersion {
    return new ConfigVersion(1);
  }

  public static of(value: number): ConfigVersion {
    return new ConfigVersion(value);
  }

  public increment(): ConfigVersion {
    return new ConfigVersion(this.value + 1);
  }
}


















