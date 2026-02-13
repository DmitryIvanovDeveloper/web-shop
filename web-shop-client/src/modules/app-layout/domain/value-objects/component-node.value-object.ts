import { Result } from '../../../shared/result/result';
import { AppLayoutError } from '../errors/ui-renderer.error';
import type { StyleConfig, ActionsConfig } from '../types';

export class ComponentNode {
  private constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly props: Readonly<Record<string, any>>,
    public readonly styles: Readonly<StyleConfig>,
    public readonly children: readonly ComponentNode[],
    public readonly actions?: Readonly<ActionsConfig>
  ) {}

  public static create(params: {
    readonly id: string;
    readonly type: string;
    readonly props?: Record<string, any>;
    readonly styles?: StyleConfig;
    readonly children?: readonly ComponentNode[];
    readonly actions?: ActionsConfig;
  }): Result<ComponentNode, AppLayoutError> {
    if (!params.id || !params.type) {
      return Result.error(new AppLayoutError('Invalid node', 'INVALID_CONFIG'));
    }

    return Result.ok(
      new ComponentNode(
        params.id,
        params.type,
        Object.freeze(params.props || {}),
        Object.freeze(params.styles || {}),
        Object.freeze(params.children || []),
        params.actions ? Object.freeze(params.actions) : undefined
      )
    );
  }

  public equals(other: ComponentNode): boolean {
    return (
      this.id === other.id &&
      this.type === other.type &&
      JSON.stringify(this.props) === JSON.stringify(other.props) &&
      JSON.stringify(this.styles) === JSON.stringify(other.styles)
    );
  }
}

