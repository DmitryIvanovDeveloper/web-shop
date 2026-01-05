'use client';

import { useState, useEffect, useMemo } from 'react';
import { DynamicRenderer } from './dynamic-renderer';
import type { SidebarRendererPresenter } from '../../presenters/sidebar-renderer.presenter';
import type { ActionContext } from '../../../../../shared/ui/action-context';

interface SidebarRendererProps {
  readonly presenter: SidebarRendererPresenter;
  readonly actionContext?: ActionContext;
  readonly layoutType?: 'sidebar' | 'rightSidebar' | 'store';
}

export function SidebarRenderer({
  presenter,
  actionContext,
  layoutType = 'sidebar'
}: SidebarRendererProps): JSX.Element {
  console.log('[SidebarRenderer] Component rendered for', layoutType);

  const [configVersion, setConfigVersion] = useState(0);

  // Subscribe to config updates (for live preview updates)
  useEffect(() => {
    // Check if already ready and trigger initial render
    if (presenter.isReady()) {
      setConfigVersion(1);
    }

    const unsubscribe = presenter.subscribe(() => {
      // Force re-render when config changes
      console.log('[SidebarRenderer] Config update received, forcing re-render');
      setConfigVersion(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter]);

  // Синхронно получаем конфигурацию из presenter
  // configVersion инкрементируется при каждом subscribe callback
  const config = useMemo(() => {
    console.log('[SidebarRenderer] Getting config for', layoutType, 'version:', configVersion);
    if (configVersion === 0) return null;

    let result = null;
    switch (layoutType) {
      case 'sidebar':
        result = presenter.getSidebar();
        console.log('[SidebarRenderer] Got sidebar config:', !!result);
        return result;
      case 'rightSidebar':
        result = presenter.getRightSidebar();
        console.log('[SidebarRenderer] Got rightSidebar config:', !!result);
        return result;
      case 'store':
        return presenter.getStore();
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configVersion, layoutType]);

  // Если конфигурация еще не загружена
  if (!config) {
    console.log('[SidebarRenderer] No config available for', layoutType);
    return (
      <div style={{ padding: '16px', color: '#A0A0A0' }}>
        {presenter.labels.notReady}
      </div>
    );
  }

  console.log('[SidebarRenderer] Rendering', layoutType, 'with layout:', config.layout?.id);
  console.log('[SidebarRenderer] Children count:', config.layout?.children?.length || 0);
  if (config.layout?.children) {
    config.layout.children.forEach((child, index) => {
      console.log(`[SidebarRenderer] Child ${index}:`, child.id, child.props?.text);
    });
  }

  return (
    <DynamicRenderer
      node={config.layout}
      theme={config.theme}
      actionContext={actionContext}
    />
  );
}
