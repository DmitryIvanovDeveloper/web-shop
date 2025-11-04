'use client';

import React, { Suspense } from 'react';
import { UIBuilderPage } from '@/modules/ui-builder/interface-adapters/ui/pages/UIBuilderPage';
import { container } from '@/infrastructure/bootstrap/container';
import { UI_BUILDER_TYPES } from '@/modules/ui-builder/infrastructure/bootstrap/types';
import { useSearchParams } from 'next/navigation';

function UIBuilderContent(): JSX.Element {
  const searchParams = useSearchParams();
  const presenter = container.get<any>(UI_BUILDER_TYPES.UIBuilderPresenter);
  const appId = searchParams.get('appId') || 'APP123';
  return <UIBuilderPage presenter={presenter} appId={appId} />;
}

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UIBuilderContent />
    </Suspense>
  );
}

 
