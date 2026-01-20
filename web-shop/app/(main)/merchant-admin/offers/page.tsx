import { OffersPage } from '@/modules/merchant-admin/offers/interface-adapters/views';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
}

export default async function MerchantAdminOffersPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const appId = params.appId;

  if (!appId) {
    redirect('/projects');
  }

  return <OffersPage appId={appId} />;
}

