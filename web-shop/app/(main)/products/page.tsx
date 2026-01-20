import { ProductsPage } from '@/modules/merchant-admin/products/interface-adapters/views';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
}

export default async function ProductsPageRoute({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const appId = params.appId;

  if (!appId) {
    redirect('/projects');
  }

  return <ProductsPage appId={appId} />;
}

