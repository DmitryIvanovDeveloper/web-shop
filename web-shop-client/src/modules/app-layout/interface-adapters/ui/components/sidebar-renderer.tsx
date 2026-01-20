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
    const [, forceUpdate] = useState(0);
  const pathname = usePathname();

      const activePathname = currentPathname || pathname;
      presenter.setCurrentPathname(activePathname); 
    useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
            forceUpdate(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [presenter]);

    let config = null;
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
    default:
      return (
        <div style={{ padding: '16px', color: '#A0A0A0' }}>
          Unknown layout type: {layoutType}
        </div>
      );
  }

    if (!config) {
        return (
      <div style={{ padding: '16px', color: '#A0A0A0' }}>
        {presenter.labels.notReady}
      </div>
    );
  }

      const languageCode = presenter.getLanguageCode();

  return (
    <DynamicRenderer
      key={`${layoutType}-${languageCode}`}
      node={config.layout}
      theme={config.theme}
      actionContext={actionContext}
    />
  );
}
