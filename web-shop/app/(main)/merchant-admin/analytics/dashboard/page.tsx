'use client';

import { useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardPage } from '@/modules/merchant-admin/analytics/realtime-dashboard/interface-adapters/views';

export default function Page(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams?.get('appId');

  // Redirect to projects page if appId is missing (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    if (!appId) {
      router.push('/projects');
    }
  }, [appId, router]);

  return <DashboardPage />;
}



