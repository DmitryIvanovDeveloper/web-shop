'use client';

import type { ComponentNode } from '../../../domain/value-objects/component-node.value-object';
import type { ThemeConfig } from '../../../domain/value-objects/theme-config.value-object';
import type { ActionContext } from '../../../../../shared/ui/action-context';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { UIRendererPort } from '../../../../../application/ports/ui-renderer.port';

interface DynamicRendererProps {
  readonly node: ComponentNode;
  readonly theme: ThemeConfig;
  readonly actionContext?: ActionContext;
}


export function DynamicRenderer({ node, theme, actionContext }: DynamicRendererProps): JSX.Element | null {
  if (!node) {
        return null;
  }
  
  console.log('[DynamicRenderer] Rendering node', {
    nodeId: node.id,
    nodeType: node.type,
    props: node.props,
    styles: node.styles,
    hasChildren: !!(node as any).children
  });
  
    const uiRenderer = container.get<UIRendererPort>(ROOT_TYPES.UIRenderer);
  
    const result = uiRenderer.renderUI({
    layout: node,
    theme,
    context: actionContext || {}
  });
  
    return result;
}

