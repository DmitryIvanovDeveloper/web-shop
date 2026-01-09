'use client';

'use client';

import { useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PatchNotesAdmin } from '@/modules/merchant-admin/patch-notes/interface-adapters/ui/PatchNotesAdmin';

export default function PatchNotesAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams?.get('appId');

  // Redirect to projects page if appId is missing (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    if (!appId) {
      router.push('/projects');
    }
  }, [appId, router]);

  return <PatchNotesAdmin />;
}
