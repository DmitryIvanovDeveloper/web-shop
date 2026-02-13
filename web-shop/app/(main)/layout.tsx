import { Suspense } from 'react';
import ClientLayout from '../client-layout';

export default function MainLayout({ children }: { children: React.ReactNode}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientLayout>{children}</ClientLayout>
    </Suspense>
  );
}

