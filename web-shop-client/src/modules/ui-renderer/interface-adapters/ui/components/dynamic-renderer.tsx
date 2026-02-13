'use client';

import { createElement, useState, useEffect, useCallback } from 'react';
import { LocalizationPresenter } from '@/modules/localization/interface-adapters/presenters/localization.presenter';
import { LOCALIZATION_TYPES } from '@/infrastructure/bootstrap/types';
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
  const getTranslation = (): { t: (key: string, fallback?: string) => string, currentLanguage: any } => {
    try {
      const presenter = container.get<LocalizationPresenter>(LOCALIZATION_TYPES.LocalizationPresenter);
      const vm = presenter.viewModel;
      const t = (key: string, fallback?: string): string => {
        return vm.translations[key] || fallback || key;
      };
      return { t, currentLanguage: vm.currentLanguage };
    } catch {
      const t = (key: string, fallback?: string): string => fallback || key;
      return { t, currentLanguage: null };
    }
  };

  const { t, currentLanguage } = getTranslation();

  // All hooks must be declared before any conditional returns
  const [isHovered, setIsHovered] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);

  const registry = container.get<ComponentRegistry>(UI_RENDERER_TYPES.ComponentRegistry);
  const styleBuilder = container.get<StyleBuilder>(UI_RENDERER_TYPES.StyleBuilder);
  const actionHandler = container.get<ActionHandler>(UI_RENDERER_TYPES.ActionHandler);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleModeChange = (event: CustomEvent) => {
      const enabled = event.detail?.enabled ?? false;
      setElementSelectionMode(enabled);
    };

    const initialMode = readSelectionModeFlag();
    setElementSelectionMode(initialMode);

    window.addEventListener('elementSelectionModeChanged', handleModeChange as EventListener);

    return () => {
      window.removeEventListener('elementSelectionModeChanged', handleModeChange as EventListener);
    };
  }, [node.id]);

  const processLocalizedProps = useCallback((props: any) => {
    if (!props) return props;

    const processedProps = { ...props };

    if (typeof processedProps.text === 'string' && processedProps.text.startsWith('i18n:')) {
      const key = processedProps.text.replace('i18n:', '');
      processedProps.text = t(key);
    }

    return processedProps;
  }, [currentLanguage]);

  const Component = registry.getComponent(node.type);
  if (!Component) {
    return null;
  }
  
  if (node.type === 'DataGrid') {
  }

  const styles = actionContext?.isLoading && node.styles?.loadingStyles 
    ? { ...node.styles, ...node.styles.loadingStyles }
    : node.styles;
    
  const className = styleBuilder.buildClassName(styles, theme);
  let style = styleBuilder.buildInlineStyles(styles, theme, node.type);
  
  if (node.type === 'Text') {
  }
  
  const isSelectionModeActive = isPreviewMode() && elementSelectionMode && node.id;
  if (isSelectionModeActive && isHovered) {
    style = {
      ...style,
      boxShadow: '0 0 0 2px #3b82f6',
      position: style.position || 'relative',
    };
  }

  if (node.id === 'main-content' && node.type === 'Container') {
    const { backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, ...restStyle } = style;
    style = restStyle;
  } 

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

  const handleClick = (e?: React.MouseEvent) => {
    if (isPreviewMode() && elementSelectionMode && node.id) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (typeof document !== 'undefined') {
        const allElements = document.querySelectorAll('[data-element-id]');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          htmlEl.dispatchEvent(mouseLeaveEvent);
          htmlEl.classList.remove('preview-hover');
          htmlEl.style.removeProperty('cursor');
          htmlEl.style.removeProperty('outline');
          htmlEl.style.removeProperty('outline-offset');
          htmlEl.style.removeProperty('box-shadow');
          htmlEl.style.removeProperty('overflow');
          htmlEl.style.removeProperty('border');
        });
      }
      
      setIsHovered(false);
      
      let elementIdToSend = node.id;
      if (e?.currentTarget) {
        const dataElementId = (e.currentTarget as HTMLElement).getAttribute('data-element-id');
        if (dataElementId && dataElementId !== node.id) {
          elementIdToSend = dataElementId;
        }
      }
      
      if (window.parent && window.parent !== window) {
        const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL || '*';
        
        if (window.parent && typeof window.parent.postMessage === 'function') {
          try {
            window.parent.postMessage(
              { type: 'ELEMENT_SELECTED', elementId: elementIdToSend },
              builderOrigin
            );
          } catch (error) {
          }
        }
      }
      return;
    }

    const actionsToUse = buttonActions || node.actions;
    if (actionsToUse?.onClick && actionContext) {
      actionHandler.handleAction(actionsToUse.onClick, actionContext);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isPreviewMode() && elementSelectionMode && node.id) {
      const target = e.currentTarget as HTMLElement;
      const eventTarget = e.target as HTMLElement;
      
      if (eventTarget !== target) {
        const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
        if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
          return;
        }
      }
      
      setIsHovered(true);
      if (!target.classList.contains('preview-hover')) {
        target.classList.add('preview-hover');
      }
      target.style.setProperty('cursor', 'pointer', 'important');
      target.style.setProperty('box-shadow', '0 0 0 2px #3b82f6', 'important');
      target.style.setProperty('position', 'relative', 'important');
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isPreviewMode() && elementSelectionMode && node.id) {
      setIsHovered(false);
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('preview-hover');
      target.style.removeProperty('cursor');
      target.style.removeProperty('box-shadow');
    }
  };

  const actionsToCheck = buttonActions || node.actions;
  const clickHandler = (actionsToCheck?.onClick && actionContext) || isPreviewMode() 
    ? handleClick 
    : undefined;

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

  const popupProps = node.type === 'Popup' && actionContext?.onPopupClose
    ? { onClose: actionContext.onPopupClose }
    : {};

  const containerProps = {
    ...(node.type === 'Container' && node.styles?.gap ? { gap: node.styles.gap, vertical: true } : {})
  };

  const inputTextProps = node.type === 'InputText' 
    ? { 
        onChange: (value: string) => {
        }
      }
    : {};

  const universalInputProps = node.type === 'UniversalInput' 
    ? { 
        onChange: (value: string | number) => {
        }
      }
    : {};

  const inputProps = node.type === 'Input' 
    ? { 
        onChange: (value: string | number) => {
          if (node.actions?.onChange && actionContext) {
            actionHandler.handleAction(node.actions.onChange, actionContext, value);
          }
        }
      }
    : {};

  const selectProps = node.type === 'Select' 
    ? { 
        onChange: (value: string | number) => {
          if (node.actions?.onChange && actionContext) {
            actionHandler.handleAction(node.actions.onChange, actionContext, value);
          }
        }
      }
    : {};

  const offersListProps = {};

  const previewMode = isPreviewMode();

  const processedProps = processLocalizedProps(node.props);

  const buttonProps = node.type === 'Button'
    ? { text: processedProps?.text || processedProps?.children }
    : {};

  const { pageSlug, ...propsWithoutPageSlug } = processedProps || {};
  
  const selectionModeProps = isSelectionModeActive ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};
  
  let mergedClassName = className || '';
  if (isSelectionModeActive && isHovered) {
    if (!mergedClassName.includes('preview-hover')) {
      mergedClassName = `${mergedClassName} preview-hover`.trim();
    }
  }
  
  const componentProps = {
    ...propsWithoutPageSlug,
    ...popupProps,
    ...containerProps,
    ...inputTextProps,
    ...universalInputProps,
    ...inputProps,
    ...selectProps,
    ...offersListProps,
    ...buttonProps,
    ...previewProps,
    ...selectionModeProps,
    className: mergedClassName,
    style,
    children,
    onClick: handleClick,
    isLoading: actionContext?.isLoading || false,
  };

  try {
    const componentKey = `${node.id}-${currentLanguage?.code || 'default'}`;
    return createElement(Component, { ...componentProps, key: componentKey });
  } catch (error) {
    return <div className="error-fallback">Error rendering {node.type}</div>;
  }
}


