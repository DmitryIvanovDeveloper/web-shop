'use client';

import { useState, useEffect, useMemo } from 'react';
import { DynamicRenderer } from './dynamic-renderer';
import type { SidebarRendererPresenter } from '../../presenters/sidebar-renderer.presenter';
import type { ActionContext } from '../../../domain/types';

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
  const [configVersion, setConfigVersion] = useState(0);

  // Subscribe to config updates (for live preview updates)
  useEffect(() => {
    // Check if already ready and trigger initial render
    if (presenter.isReady()) {
      setConfigVersion(1);
    }

    const unsubscribe = presenter.subscribe(() => {
      console.log('[SidebarRenderer] Config updated, incrementing configVersion');
      // Force re-render when config changes
      setConfigVersion(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter]);

  // Синхронно получаем конфигурацию из presenter
  // configVersion инкрементируется при каждом subscribe callback
  const config = useMemo(() => {
    console.log('[SidebarRenderer] useMemo triggered, configVersion:', configVersion, 'layoutType:', layoutType);
    if (configVersion === 0) return null;
    
    switch (layoutType) {
      case 'sidebar':
        return presenter.getSidebar();
      case 'rightSidebar':
        return presenter.getRightSidebar();
      case 'store':
        return presenter.getStore();
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configVersion, layoutType]);

  // Если конфигурация еще не загружена
  if (!config) {
    return (
      <div style={{ padding: '16px', color: '#A0A0A0' }}>
        {presenter.labels.notReady}
      </div>
    );
  }

  return (
    <DynamicRenderer 
      node={config.layout} 
      theme={config.theme} 
      actionContext={actionContext} 
    />
  );
}

