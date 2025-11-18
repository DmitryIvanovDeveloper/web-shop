import { ProductsPage } from '@/modules/merchant-admin/products/interface-adapters/views';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
}

export default async function ProductsPageRoute({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const appId = params.appId ?? process.env.NEXT_PUBLIC_APP_ID;

  if (!appId) {
    throw new Error('App ID is required to render products page');
  }

  return <ProductsPage appId={appId} />;
}


