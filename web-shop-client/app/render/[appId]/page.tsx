'use client';

import { SiteRenderer } from '@/shared/components/site-renderer';

interface RenderPageProps {
  params: Promise<{
    appId: string;
  }>;
}

export default async function RenderPage({ params }: RenderPageProps) {
  const resolvedParams = await params;

  return (
    <div className="w-full h-screen">
      <SiteRenderer appId={resolvedParams.appId} />
    </div>
  );
}