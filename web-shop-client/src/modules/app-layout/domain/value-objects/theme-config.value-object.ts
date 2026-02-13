import { Result } from '../../../../shared/result/result';
import { AppLayoutError } from '../errors/ui-renderer.error';

export interface ColorConfig {
  readonly primary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
}

export class ThemeConfig {
  private constructor(
    public readonly colors: Readonly<ColorConfig>,
    public readonly spacing: readonly number[]
  ) {}

  public static create(params: {
    readonly colors: Record<string, string>;
    readonly spacing: readonly number[];
  }): Result<ThemeConfig, AppLayoutError> {
        if (
      !params.colors.primary ||
      !params.colors.background ||
      !params.colors.surface ||
      !params.colors.text
    ) {
      return Result.error(
        new AppLayoutError('Missing required color keys', 'INVALID_CONFIG')
      );
    }

    const colorConfig: ColorConfig = {
      primary: params.colors.primary,
      background: params.colors.background,
      surface: params.colors.surface,
      text: params.colors.text,
    };

    return Result.ok(new ThemeConfig(Object.freeze(colorConfig), Object.freeze(params.spacing)));
  }

  public equals(other: ThemeConfig): boolean {
    return (
      JSON.stringify(this.colors) === JSON.stringify(other.colors) &&
      JSON.stringify(this.spacing) === JSON.stringify(other.spacing)
    );
  }
}


