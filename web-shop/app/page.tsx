'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectsPage from '../src/modules/merchant-admin/projects/interface-adapters/views/ProjectsPage';

export default function ProjectManagementPage() {
  const searchParams = useSearchParams();
  const merchantId = searchParams?.get('merchantId') || '550e8400-e29b-41d4-a716-446655440000';

  return <ProjectsPage merchantId={merchantId} />;
}
