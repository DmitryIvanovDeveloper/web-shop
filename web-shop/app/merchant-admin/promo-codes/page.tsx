import { PromoCodesPage } from '@/modules/merchant-admin/promo-codes/interface-adapters/views';

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
    throw new Error('App ID is required to render merchant promo codes page');
  }

  return <PromoCodesPage appId={appId} />;
}










