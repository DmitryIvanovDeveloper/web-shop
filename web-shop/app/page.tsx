'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectsPage from '../src/modules/merchant-admin/projects/interface-adapters/views/ProjectsPage';

function ProjectManagementContent() {
  const searchParams = useSearchParams();
  // Support both "merchantId" and "merchantid"; fallback to demo ID if missing
  const merchantIdFromQuery =
    searchParams?.get('merchantId') ?? searchParams?.get('merchantid');
  const merchantId = merchantIdFromQuery || '550e8400-e29b-41d4-a716-446655440000';

  return <ProjectsPage merchantId={merchantId} />;
}

export default function ProjectManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectManagementContent />
    </Suspense>
  );
}
