'use client';

import { createElement } from 'react';
import type { ComponentNode } from '../../../domain/value-objects/component-node.value-object';
import type { ThemeConfig } from '../../../domain/value-objects/theme-config.value-object';
import type { ComponentRegistry } from '../../../infrastructure/services/component-registry.service';
import type { StyleBuilder } from '../../../infrastructure/services/style-builder.service';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../../../infrastructure/bootstrap/types';
import { OfferCard } from '../../../../../../src/shared/components/molecules/offer-card';

interface DynamicRendererProps {
  readonly node: ComponentNode;
  readonly theme: ThemeConfig;
}

export function DynamicRenderer({ node, theme }: DynamicRendererProps): JSX.Element | null {
  const registry = container.get<ComponentRegistry>(UI_RENDERER_TYPES.ComponentRegistry);
  const styleBuilder = container.get<StyleBuilder>(UI_RENDERER_TYPES.StyleBuilder);

  const Component = registry.getComponent(node.type);
  if (!Component) {
    console.warn(`Component not found: ${node.type}`);
    return null;
  }

  const className = styleBuilder.buildClassName(node.styles, theme);
  const style = styleBuilder.buildInlineStyles(node.styles, theme);

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
          <DynamicRenderer key={child.id || idx} node={child} theme={theme} />
        ))
      : undefined;

  // Типобезопасные props - TypeScript знает структуру
  const componentProps = {
    ...node.props,
    className,
    style,
    children,
  };

  return createElement(Component, componentProps);
}

