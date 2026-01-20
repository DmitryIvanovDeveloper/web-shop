import { PromoCodesPage } from '@/modules/merchant-admin/promo-codes/interface-adapters/views';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
}

export default async function MerchantAdminPromoCodesPage(
  props: PageProps
): Promise<JSX.Element> {
  const params = await props.searchParams;
  const appId = params.appId ?? process.env.NEXT_PUBLIC_APP_ID;

  if (!appId) {
    redirect('/projects');
  }

  return <PromoCodesPage appId={appId} />;
}

