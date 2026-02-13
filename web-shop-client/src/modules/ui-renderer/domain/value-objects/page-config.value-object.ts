import { Result } from '../../../../shared/result/result';
import type { ThemeConfig } from './theme-config.value-object';
import type { ComponentNode } from './component-node.value-object';
import { UIRendererError } from '../errors/ui-renderer.error';

export class PageConfig {
  private constructor(
    public readonly type: string,
    public readonly version: string,
    public readonly theme: ThemeConfig,
    public readonly layout: ComponentNode
  ) {}

  public static create(params: {
    readonly type: string;
    readonly version: string;
    readonly theme: ThemeConfig;
    readonly layout: ComponentNode;
  }): Result<PageConfig, UIRendererError> {
    if (!params.type || !params.version) {
      return Result.error(new UIRendererError('Invalid config', 'INVALID_CONFIG'));
    }
    return Result.ok(new PageConfig(params.type, params.version, params.theme, params.layout));
  }

  public equals(other: PageConfig): boolean {
    return (
      this.type === other.type &&
      this.version === other.version &&
      this.theme.equals(other.theme) &&
      this.layout.equals(other.layout)
    );
  }
}


