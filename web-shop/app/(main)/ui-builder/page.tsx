'use client';

import React, { Suspense, useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UIBuilderPage } from '@/modules/ui-builder/interface-adapters/ui/pages/UIBuilderPage';
import { container } from '@/infrastructure/bootstrap/container';
import { UI_BUILDER_TYPES } from '@/modules/ui-builder/infrastructure/bootstrap/types';

function UIBuilderContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presenter = container.get<any>(UI_BUILDER_TYPES.UIBuilderPresenter);
  const appId = searchParams?.get('appId');
  const role = searchParams?.get('role');
  const isAdmin = role === 'admin';

  useLayoutEffect(() => {
    
    if (!appId && !isAdmin) {
      router.push('/projects');
    }
  }, [appId, isAdmin, router]);

  if (!appId && !isAdmin) {
    return <div>Redirecting...</div>;
  }

  return <UIBuilderPage presenter={presenter} appId={appId || ''} />;
}

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UIBuilderContent />
    </Suspense>
  );
}

