import { Result } from '../../../../shared/domain/result/result';
import { UIRendererError } from '../errors/ui-renderer.error';
import type { StyleConfig, ButtonProps, ContainerProps, BadgeProps, ImageProps, TextProps, GridProps, DataGridProps, OfferCardProps } from '../types';

// Типобезопасный ComponentNode без any
export class ComponentNode {
  private constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly props: Readonly<ButtonProps | ContainerProps | BadgeProps | ImageProps | TextProps | GridProps | DataGridProps | OfferCardProps>,
    public readonly styles: Readonly<StyleConfig>,
    public readonly children: readonly ComponentNode[]
  ) {}

  public static create(params: {
    readonly id: string;
    readonly type: string;
    readonly props?: ButtonProps | ContainerProps | BadgeProps | ImageProps | TextProps | GridProps | DataGridProps | OfferCardProps;
    readonly styles?: StyleConfig;
    readonly children?: readonly ComponentNode[];
  }): Result<ComponentNode, UIRendererError> {
    if (!params.id || !params.type) {
      return Result.error(new UIRendererError('Invalid node', 'INVALID_CONFIG'));
    }

    return Result.ok(
      new ComponentNode(
        params.id,
        params.type,
        Object.freeze(params.props || {}),
        Object.freeze(params.styles || {}),
        Object.freeze(params.children || [])
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

