'use client';

import { createElement, useState, useEffect } from 'react';
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

// Check if in preview mode
const isPreviewMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('previewMode') === 'true';
};

const readSelectionModeFlag = (): boolean => {
  if (typeof document !== 'undefined' && document.body) {
    return document.body.getAttribute('data-selection-mode') === 'true';
  }
  if (typeof window !== 'undefined') {
    return (window as any).__elementSelectionMode === true;
  }
  return false;
};

export function DynamicRenderer({ node, theme, actionContext }: DynamicRendererProps): JSX.Element | null {
  console.log('[DynamicRenderer] Rendering with node:', node);
  console.log('[DynamicRenderer] Node type:', node?.type);
  
  if (!node) {
    console.error('[DynamicRenderer] Node is undefined or null');
    return null;
  }
  
  console.log('[DynamicRenderer] UI_RENDERER_TYPES:', UI_RENDERER_TYPES);
  console.log('[DynamicRenderer] ComponentRegistry symbol:', UI_RENDERER_TYPES.ComponentRegistry);
  
  const registry = container.get<ComponentRegistry>(UI_RENDERER_TYPES.ComponentRegistry);
  const styleBuilder = container.get<StyleBuilder>(UI_RENDERER_TYPES.StyleBuilder);
  const actionHandler = container.get<ActionHandler>(UI_RENDERER_TYPES.ActionHandler);

  // State for hover effect in element selection mode
  const [isHovered, setIsHovered] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);

  // Listen for element selection mode changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleModeChange = (event: CustomEvent) => {
      const enabled = event.detail?.enabled ?? false;
      console.log('[DynamicRenderer] Received elementSelectionModeChanged event:', enabled, { nodeId: node.id });
      setElementSelectionMode(enabled);
    };

    const initialMode = readSelectionModeFlag();
    setElementSelectionMode(initialMode);

    window.addEventListener('elementSelectionModeChanged', handleModeChange as EventListener);

    return () => {
      window.removeEventListener('elementSelectionModeChanged', handleModeChange as EventListener);
    };
  }, [node.id]);

  const Component = registry.getComponent(node.type);
  if (!Component) {
    console.warn(`Component not found: ${node.type}`);
    console.warn(`Available components:`, Array.from(registry['_components'].keys()));
    return null;
  }
  
  // Debug для DataGrid
  if (node.type === 'DataGrid') {
  }

  // Определяем стили в зависимости от loading состояния
  const styles = actionContext?.isLoading && node.styles?.loadingStyles 
    ? { ...node.styles, ...node.styles.loadingStyles }
    : node.styles;
    
  const className = styleBuilder.buildClassName(styles, theme);
  let style = styleBuilder.buildInlineStyles(styles, theme, node.type);
  
  // Add outline styles for hover in selection mode
  const isSelectionModeActive = isPreviewMode() && elementSelectionMode && node.id;
  if (isSelectionModeActive && isHovered) {
    style = {
      ...style,
      outline: '2px solid #3b82f6',
      outlineOffset: '2px',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      position: style.position || 'relative',
    };
  }

  // For main-content Container, remove background styles (they're applied to body)
  if (node.id === 'main-content' && node.type === 'Container') {
    const { backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, ...restStyle } = style;
    style = restStyle;
  } 

  // For Button with pageSlug, create navigate action if not already set
  let buttonActions = node.actions;
  if (node.type === 'Button' && node.props?.pageSlug && typeof node.props.pageSlug === 'string' && !node.actions?.onClick) {
    buttonActions = {
      ...node.actions,
      onClick: {
        type: 'navigate',
        url: `/${node.props.pageSlug}`
      }
    };
  }

  // Обработка onClick action с поддержкой preview mode
  const handleClick = (e?: React.MouseEvent) => {
    console.log('[DynamicRenderer] handleClick called', {
      nodeId: node.id,
      nodeType: node.type,
      isPreviewMode: isPreviewMode(),
      elementSelectionMode: elementSelectionMode
    });
    
    // Preview mode + element selection mode - send element selection to parent window
    if (isPreviewMode() && elementSelectionMode && node.id) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Remove outline from all elements when clicking
      // Trigger mouseleave event on all elements to ensure hover handlers are called
      if (typeof document !== 'undefined') {
        const allElements = document.querySelectorAll('[data-element-id]');
        console.log(`[DynamicRenderer] Removing outline from ${allElements.length} elements after click`);
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          // Trigger mouseleave event to ensure hover handlers clean up
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          htmlEl.dispatchEvent(mouseLeaveEvent);
          // Also manually remove styles as fallback
          htmlEl.classList.remove('preview-hover');
          htmlEl.style.removeProperty('cursor');
          htmlEl.style.removeProperty('outline');
          htmlEl.style.removeProperty('outline-offset');
          htmlEl.style.removeProperty('box-shadow');
          htmlEl.style.removeProperty('overflow');
          htmlEl.style.removeProperty('border');
        });
        console.log(`[DynamicRenderer] Outline removed from all elements`);
      }
      
      // Reset hover state
      setIsHovered(false);
      
      console.log('[DynamicRenderer] Element clicked in selection mode:', node.id);
      
      // Also check if element has data-element-id attribute that might differ from node.id
      let elementIdToSend = node.id;
      if (e?.currentTarget) {
        const dataElementId = (e.currentTarget as HTMLElement).getAttribute('data-element-id');
        if (dataElementId && dataElementId !== node.id) {
          console.log('[DynamicRenderer] Element has different data-element-id:', {
            nodeId: node.id,
            dataElementId,
            using: dataElementId
          });
          elementIdToSend = dataElementId;
        }
      }
      
      if (window.parent && window.parent !== window) {
        const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL || '*';
        console.log('[DynamicRenderer] Sending ELEMENT_SELECTED to parent:', {
          elementId: elementIdToSend,
          nodeId: node.id,
          origin: builderOrigin
        });
        
        window.parent.postMessage(
          { type: 'ELEMENT_SELECTED', elementId: elementIdToSend },
          builderOrigin
        );
      } else {
        console.warn('[DynamicRenderer] No parent window or same window');
      }
      return;
    }

    // Normal mode - handle action
    console.log('[DynamicRenderer] Normal mode - handling action');
    // Use buttonActions if it was set (for pageSlug navigation), otherwise use node.actions
    const actionsToUse = buttonActions || node.actions;
    if (actionsToUse?.onClick && actionContext) {
      actionHandler.handleAction(actionsToUse.onClick, actionContext);
    }
  };

  // Hover handlers for element selection mode
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isPreviewMode() && elementSelectionMode && node.id) {
      const target = e.currentTarget as HTMLElement;
      const eventTarget = e.target as HTMLElement;
      
      // Check if the cursor is actually over this element, not a child element with data-element-id
      // If a child element with data-element-id is being hovered, don't highlight the parent
      if (eventTarget !== target) {
        // The cursor is over a child element, not this element
        // Check if the child has its own data-element-id
        const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
        if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
          // A child element with data-element-id is being hovered, don't highlight parent
          return;
        }
      }
      
      console.log('[DynamicRenderer] Mouse enter on element:', node.id, { elementSelectionMode, previewMode: isPreviewMode(), nodeType: node.type });
      setIsHovered(true);
      // Apply outline styles directly to DOM element for immediate feedback
      if (!target.classList.contains('preview-hover')) {
        target.classList.add('preview-hover');
      }
      // Use setProperty with important flag to ensure styles are applied
      target.style.setProperty('cursor', 'pointer', 'important');
      target.style.setProperty('outline', '2px solid #3b82f6', 'important');
      target.style.setProperty('outline-offset', '2px', 'important');
      target.style.setProperty('box-shadow', '0 0 0 2px rgba(59, 130, 246, 0.3)', 'important');
      target.style.setProperty('position', 'relative', 'important');
      // Ensure outline is not clipped
      target.style.setProperty('overflow', 'visible', 'important');
      // Also add border as fallback
      target.style.setProperty('border', '2px solid #3b82f6', 'important');
      console.log('[DynamicRenderer] Applied outline styles to:', node.id, {
        outline: target.style.outline,
        outlineOffset: target.style.outlineOffset,
        border: target.style.border,
        hasClass: target.classList.contains('preview-hover')
      });
      // Don't stop propagation - allow hover to work on other elements
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isPreviewMode() && elementSelectionMode && node.id) {
      console.log('[DynamicRenderer] Mouse leave on element:', node.id);
      setIsHovered(false);
      // Remove outline styles from DOM element
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('preview-hover');
      target.style.removeProperty('cursor');
      target.style.removeProperty('outline');
      target.style.removeProperty('outline-offset');
      target.style.removeProperty('box-shadow');
      target.style.removeProperty('overflow');
      target.style.removeProperty('border');
      // Don't stop propagation - allow hover to work on other elements
    }
  };

  // Use buttonActions if it was set (for pageSlug navigation), otherwise use node.actions
  const actionsToCheck = buttonActions || node.actions;
  const clickHandler = (actionsToCheck?.onClick && actionContext) || isPreviewMode() 
    ? handleClick 
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
  // НЕ устанавливаем className здесь, он будет установлен позже после мержа с selectionModeProps
  const containerProps = { 
    ...(node.type === 'Container' && node.styles?.gap ? { gap: node.styles.gap, vertical: true } : {}),
    ...(node.type === 'Container' && node.id === 'sidebar-container' ? { sidebar: true } : {})
  };

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

  // Check preview mode
  const previewMode = isPreviewMode();

  // Add data-element-id for preview mode to enable color updates and selection
  const previewProps = node.id ? { 'data-element-id': node.id } : {};
  
  // Debug: log when container has data-element-id
  if (node.type === 'Container' && node.id === 'sidebar-container' && previewProps['data-element-id']) {
    console.log('[DynamicRenderer] sidebar-container has data-element-id:', previewProps['data-element-id']);
  }
  
  // Debug: log when Text component has data-element-id
  if (node.type === 'Text' && previewProps['data-element-id']) {
    console.log('[DynamicRenderer] Text component has data-element-id:', {
      nodeId: node.id,
      dataElementId: previewProps['data-element-id'],
      hasId: !!node.id
    });
  }

  // Специальная обработка для Button - text уже в node.props, но убеждаемся что он передаётся
  const buttonProps = node.type === 'Button'
    ? { text: node.props?.text || node.props?.children }
    : {};

  // Типобезопасные props - TypeScript знает структуру
  // Exclude pageSlug from props passed to DOM (it's only used for action creation)
  const { pageSlug, ...propsWithoutPageSlug } = node.props || {};
  
  // Add hover class and handlers for element selection mode
  // isSelectionModeActive already declared above (line 99)
  const selectionModeProps = isSelectionModeActive ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};
  
  // Merge className: always add preview-hover when hovered in selection mode
  // Make sure preview-hover is added at the end so it can override other styles
  let mergedClassName = className || '';
  if (isSelectionModeActive && isHovered) {
    // Add preview-hover class if not already present
    if (!mergedClassName.includes('preview-hover')) {
      mergedClassName = `${mergedClassName} preview-hover`.trim();
    }
  }
  
  // Debug logging for hover state (for buttons and containers in sidebar)
  if (isSelectionModeActive && node.id && (node.type === 'Button' || node.type === 'Container')) {
    console.log('[DynamicRenderer] Selection mode active for', node.type, ':', {
      nodeId: node.id,
      isHovered,
      elementSelectionMode,
      mergedClassName,
      hasSelectionHandlers: !!selectionModeProps.onMouseEnter,
      previewMode: isPreviewMode(),
      isSelectionModeActive
    });
  }
  
  const componentProps = {
    ...propsWithoutPageSlug,
    ...popupProps,
    ...containerProps,
    ...inputTextProps,
    ...universalInputProps,
    ...inputProps,
    ...offersListProps,
    ...buttonProps,
    ...previewProps,
    ...selectionModeProps, // Must be before className to ensure handlers are included
    className: mergedClassName,
    style,
    children,
    onClick: handleClick,
    isLoading: actionContext?.isLoading || false,
  };

  try {
    return createElement(Component, componentProps);
  } catch (error) {
    console.error(`[DynamicRenderer] Error rendering ${node.type}:`, error);
    return <div className="error-fallback">Error rendering {node.type}</div>;
  }
}
