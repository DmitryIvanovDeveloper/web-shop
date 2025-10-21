'use client';

import { createElement } from 'react';
import type { ComponentNode } from '../../../domain/value-objects/component-node.value-object';
import type { ThemeConfig } from '../../../domain/value-objects/theme-config.value-object';
import type { ComponentRegistry } from '../../../infrastructure/services/component-registry.service';
import type { StyleBuilder } from '../../../infrastructure/services/style-builder.service';
import type { ActionHandler } from '../../../infrastructure/services/action-handler.service';
import type { ActionContext } from '../../../domain/types';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../../../infrastructure/bootstrap/types';
import { OfferCard } from '../../../../../../src/shared/components/molecules/offer-card';

interface DynamicRendererProps {
  readonly node: ComponentNode;
  readonly theme: ThemeConfig;
  readonly actionContext?: ActionContext;
}

export function DynamicRenderer({ node, theme, actionContext }: DynamicRendererProps): JSX.Element | null {
  console.log('[DynamicRenderer] Rendering with node:', node);
  console.log('[DynamicRenderer] Node type:', node?.type);
  
  if (!node) {
    console.error('[DynamicRenderer] Node is undefined or null');
    return null;
  }
  
  const registry = container.get<ComponentRegistry>(UI_RENDERER_TYPES.ComponentRegistry);
  const styleBuilder = container.get<StyleBuilder>(UI_RENDERER_TYPES.StyleBuilder);
  const actionHandler = container.get<ActionHandler>(UI_RENDERER_TYPES.ActionHandler);

  const Component = registry.getComponent(node.type);
  if (!Component) {
    console.warn(`Component not found: ${node.type}`);
    console.warn(`Available components:`, Array.from(registry['_components'].keys()));
    return null;
  }
  
  // Debug для DataGrid
  if (node.type === 'DataGrid') {
  }

  const className = styleBuilder.buildClassName(node.styles, theme);
  const style = styleBuilder.buildInlineStyles(node.styles, theme);

  // Обработка onClick action
  const handleClick = node.actions?.onClick && actionContext
    ? () => {
        if (node.actions?.onClick && actionContext) {
          actionHandler.handleAction(node.actions.onClick, actionContext);
        }
      }
    : undefined;

  // Debug logging для main-content
  if (node.id === 'main-content') {
    console.log('[DynamicRenderer] main-content styles:', node.styles);
    console.log('[DynamicRenderer] main-content inline styles:', style);
  }

  // Для DataGrid передаем renderItem
  if (node.type === 'DataGrid') {
    const renderItem = (item: any, index: number) => (
      <OfferCard key={item.id || index} {...item} />
    );

    const componentProps = {
      ...node.props,
      className,
      style,
      renderItem,
    };

    return createElement(Component, componentProps);
  }

  // Для остальных компонентов рекурсивно рендерим children
  const children =
    node.children && node.children.length > 0
      ? node.children.map((child, idx) => (
          <DynamicRenderer 
            key={child.id || idx} 
            node={child} 
            theme={theme}
            actionContext={actionContext}
          />
        ))
      : undefined;

  // Для Popup компонента передаем onClose из actionContext
  const popupProps = node.type === 'Popup' && actionContext?.onPopupClose
    ? { onClose: actionContext.onPopupClose }
    : {};

  // Для Container компонентов не добавляем flex классы - UniversalContainer сам их добавит
  const finalClassName = className;
  
  const containerProps = { className: finalClassName };

      // Специальная обработка для InputText
      const inputTextProps = node.type === 'InputText' 
        ? { 
            onChange: (value: string) => {
              console.log('Input value changed:', value);
            }
          }
        : {};

      // Специальная обработка для UniversalInput
      const universalInputProps = node.type === 'UniversalInput' 
        ? { 
            onChange: (value: string | number) => {
              console.log('UniversalInput value changed:', value);
            }
          }
        : {};

      // Специальная обработка для Input
      const inputProps = node.type === 'Input' 
        ? { 
            onChange: (value: string | number) => {
              console.log('Input value changed:', value);
              // Если есть onChange action, вызываем его через ActionHandler
              if (node.actions?.onChange && actionContext) {
                actionHandler.handleAction(node.actions.onChange, actionContext, value);
              }
            }
          }
        : {};

      // Специальная обработка для OffersList (больше не нужен presenter)
      const offersListProps = {};


  // Типобезопасные props - TypeScript знает структуру
  const componentProps = {
    ...node.props,
    ...popupProps,
    ...containerProps,
    ...inputTextProps,
    ...universalInputProps,
    ...inputProps,
    ...offersListProps,
    style,
    children,
    onClick: handleClick,
  };

  try {
    return createElement(Component, componentProps);
  } catch (error) {
    console.error(`[DynamicRenderer] Error rendering ${node.type}:`, error);
    return <div className="error-fallback">Error rendering {node.type}</div>;
  }
}

