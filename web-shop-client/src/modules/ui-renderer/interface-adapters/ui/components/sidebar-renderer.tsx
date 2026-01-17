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

  useEffect(() => {
    if (presenter.isReady()) {
      setConfigVersion(1);
    }

    const unsubscribe = presenter.subscribe(() => {
      setConfigVersion(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter]);

  const config = useMemo(() => {
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
  }, [configVersion, layoutType]);

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

