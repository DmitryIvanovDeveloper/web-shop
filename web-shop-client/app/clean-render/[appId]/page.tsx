'use client';

import { SiteRenderer } from '@/shared/components/site-renderer';

interface CleanRenderPageProps {
  params: Promise<{
    appId: string;
  }>;
}

export default async function CleanRenderPage({ params }: CleanRenderPageProps) {
  const resolvedParams = await params;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <SiteRenderer appId={resolvedParams.appId} />
    </div>
  );
}