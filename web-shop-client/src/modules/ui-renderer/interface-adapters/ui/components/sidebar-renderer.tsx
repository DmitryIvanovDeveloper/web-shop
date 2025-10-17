'use client';

import { useEffect, useState } from 'react';
import { DynamicRenderer } from './dynamic-renderer';
import type { SidebarViewModel } from '../../view-models/sidebar.view-model';
import type { SidebarRendererPresenter } from '../../presenters/sidebar-renderer.presenter';
import type { ActionContext } from '../../../domain/types';

interface SidebarRendererProps {
  readonly presenter: SidebarRendererPresenter;
  readonly actionContext?: ActionContext;
}

export function SidebarRenderer({ presenter, actionContext }: SidebarRendererProps): JSX.Element {
  const [viewModel, setViewModel] = useState<SidebarViewModel>({ status: 'loading' });

  useEffect(() => {
    presenter.loadSidebar().then(setViewModel).catch((error) => {
      console.error('[SidebarRenderer] Error loading:', error);
      setViewModel({ status: 'error', error: String(error) });
    });
  }, [presenter]);

  if (viewModel.status === 'loading') {
    return <div>{presenter.labels.loading}</div>;
  }

  if (viewModel.status === 'error') {
    return (
      <div>
        {presenter.labels.error}: {viewModel.error}
      </div>
    );
  }

  return <DynamicRenderer node={viewModel.config.layout} theme={viewModel.config.theme} actionContext={actionContext} />;
}
