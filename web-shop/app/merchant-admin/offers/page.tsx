import { OffersPage } from '@/modules/merchant-admin/offers/interface-adapters/views';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
}

export default async function MerchantAdminOffersPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const appId = params.appId ?? process.env.NEXT_PUBLIC_APP_ID;

  if (!appId) {
    throw new Error('App ID is required to render merchant offers page');
  }

  return <OffersPage appId={appId} />;
}

