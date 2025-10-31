'use client';

import { useState, useEffect } from 'react';
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
  const [isReady, setIsReady] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);

  // Subscribe to config changes
  useEffect(() => {
    
    // Check if already ready
    if (presenter.isReady()) {
      setIsReady(true);
      return;
    }

    // Subscribe to config loaded event
    const unsubscribe = presenter.subscribe(() => {
      setIsReady(true);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter, layoutType]);

  // Subscribe to config updates (for live preview updates)
  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      // Force re-render when config changes
      setConfigVersion(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter]);

  // Синхронно получаем конфигурацию из presenter
  let config = null;
  
  if (isReady) {
    switch (layoutType) {
      case 'sidebar':
        config = presenter.getSidebar();
        break;
      case 'rightSidebar':
        config = presenter.getRightSidebar();
        break;
      case 'store':
        config = presenter.getStore();
        break;
    }
  }

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

