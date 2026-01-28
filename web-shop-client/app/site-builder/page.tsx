'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { GrapeJsSiteRenderer } from '@/shared/components/grapejs-site-renderer';

export default function SiteBuilderPage() {
  const searchParams = useSearchParams();
  const appId = searchParams?.get('appId') || 'app123';

  return (
    <div className="w-full h-screen">
      <GrapeJsSiteRenderer appId={appId} />
    </div>
  );
}