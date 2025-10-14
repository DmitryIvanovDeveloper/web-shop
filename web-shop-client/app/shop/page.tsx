import { AppLayout } from '../../src/components/layout/app-layout';
import { ShopModule } from '../../src/modules/shop/interface-adapters/ui';

export default function ShopPage() {
  return (
    <AppLayout>
      <ShopModule />
    </AppLayout>
  );
}
