'use client';

import '../../src/env'; // Load environment variables first
import 'reflect-metadata';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '../../src/infrastructure/bootstrap/container';
import { PageRenderer } from '../../src/modules/page-renderer/interface-adapters/ui/components/page-renderer';
import { APP_LAYOUT_TYPES } from '../../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import type { ActionContext } from '../../src/shared/ui/action-context';

interface DynamicPageProps {
  params: Promise<{ pageSlug: string }>;
  searchParams: Promise<{ appId?: string; previewMode?: string; uibuilder?: string }>;
}

export default function DynamicPage({ params, searchParams }: DynamicPageProps): JSX.Element {
  const { pageSlug } = use(params);
  const resolvedSearchParams = use(searchParams);
  const appId = resolvedSearchParams.appId || 'APP123';
  const previewMode = resolvedSearchParams.previewMode === 'true';
  
  // Get theme from sidebar presenter (similar to how main page does it)
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );
  
  const theme = sidebarPresenter.getStore()?.theme;
  
  return (
    <PageRenderer 
      appId={appId} 
      pageSlug={pageSlug} 
      theme={theme} 
      previewMode={previewMode} 
    />
  );
}


