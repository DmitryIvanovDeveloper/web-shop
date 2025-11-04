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

/**
 * DynamicRenderer - wrapper для UIRendererService
 * Преобразует ComponentNode + ThemeConfig + ActionContext в UIDescriptor
 * и делегирует рендеринг UIRendererService
 */
export function DynamicRenderer({ node, theme, actionContext }: DynamicRendererProps): JSX.Element | null {
  if (!node) {
    console.error('[DynamicRenderer] Node is undefined or null');
    return null;
  }
  
  console.log('[DynamicRenderer] Rendering node', {
    nodeId: node.id,
    nodeType: node.type,
    props: node.props,
    styles: node.styles,
    hasChildren: !!(node as any).children
  });
  
  // Получаем UIRendererService из DI контейнера
  const uiRenderer = container.get<UIRendererPort>(ROOT_TYPES.UIRenderer);
  
  // Преобразуем в UIDescriptor и рендерим
  const result = uiRenderer.renderUI({
    layout: node,
    theme,
    context: actionContext || {}
  });
  
  console.log('[DynamicRenderer] Render result', {
    nodeId: node.id,
    nodeType: node.type,
    hasResult: !!result,
    resultType: typeof result
  });
  
  return result;
}

