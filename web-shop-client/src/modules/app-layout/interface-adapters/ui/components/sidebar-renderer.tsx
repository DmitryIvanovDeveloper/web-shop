'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { DynamicRenderer } from './dynamic-renderer';
import type { SidebarRendererPresenter } from '../../presenters/sidebar-renderer.presenter';
import type { ActionContext } from '../../../../../shared/ui/action-context';

interface SidebarRendererProps {
  readonly presenter: SidebarRendererPresenter;
  readonly actionContext?: ActionContext;
  readonly layoutType?: 'sidebar' | 'rightSidebar' | 'store';
  readonly currentPathname?: string;
}

export function SidebarRenderer({
  presenter,
  actionContext,
  layoutType = 'sidebar',
  currentPathname
}: SidebarRendererProps): JSX.Element {
  console.log(`[SidebarRenderer] Component rendered for ${layoutType}`);
  const [, forceUpdate] = useState(0);
  const pathname = usePathname();

  // Update current pathname in presenter when it changes
  // Use passed pathname or fallback to hook
  const activePathname = currentPathname || pathname;
  console.log('[SidebarRenderer] Component rendered with activePathname:', activePathname, 'currentPathname prop:', currentPathname, 'pathname hook:', pathname);

  // Set pathname immediately when component renders
  presenter.setCurrentPathname(activePathname); // Removed presenter from dependencies

  // Subscribe to config updates
  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      // Force re-render when config changes
      forceUpdate(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter]);

  // Always try to get config from presenter
  let config = null;
  switch (layoutType) {
    case 'sidebar':
      config = presenter.getSidebar();
      console.log('[SidebarRenderer] Got sidebar config:', !!config);
      break;
    case 'rightSidebar':
      config = presenter.getRightSidebar();
      break;
    case 'store':
      config = presenter.getStore();
      break;
    default:
      return (
        <div style={{ padding: '16px', color: '#A0A0A0' }}>
          Unknown layout type: {layoutType}
        </div>
      );
  }

  // If no config available, show loading state
  if (!config) {
    console.log('[SidebarRenderer] No config available for', layoutType, 'returning notReady message');
    return (
      <div style={{ padding: '16px', color: '#A0A0A0' }}>
        {presenter.labels.notReady}
      </div>
    );
  }

  console.log('[SidebarRenderer] Config found for', layoutType, 'proceeding to render DynamicRenderer');

  return (
    <DynamicRenderer
      node={config.layout}
      theme={config.theme}
      actionContext={actionContext}
    />
  );
}
