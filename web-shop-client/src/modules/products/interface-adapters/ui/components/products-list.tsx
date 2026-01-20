'use client';
import { useEffect, useState } from 'react';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import { OfferCardSkeleton } from '../../../../../shared/components/molecules/offer-card-skeleton';
import { Grid } from '../../../../../shared/components/molecules/grid';
import { Product } from '../../../domain/types';
import { ProductsListViewModel } from '../../view-models/products-list.view-model';
import { ProductsListPresenter } from '../../presenters/products-list.presenter';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PRODUCTS_TYPES } from '../../../infrastructure/bootstrap/types';
import type { AuthServicePort } from '../../../application/ports/auth-service.port';

export interface ProductsListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ProductsList({ className, style }: ProductsListProps): JSX.Element | null {
  const [, forceUpdate] = useState({});

  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());

  const presenter = container.get<ProductsListPresenter>(PRODUCTS_TYPES.ProductsListPresenter);
  const authService = container.get<AuthServicePort>(PRODUCTS_TYPES.AuthService);

  const viewModel = presenter.getViewModel();

  const getAppId = (): string | null => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.appId) {
      return currentUser.appId;
    }

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const appIdFromQuery = searchParams.get('appId') || searchParams.get('app');
      if (appIdFromQuery) {
        return appIdFromQuery;
      }
    }

    return null;
  };

  useEffect(() => {
    presenter.setOnViewModelChanged(() => {
      forceUpdate({});
    });

    const loadProducts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 200));

        const appId = getAppId();
        const currentUser = authService.getCurrentUser();

        if (!appId) {
          return;
        }

        await presenter.present({
          appId,
          userId: currentUser?.userId || undefined
        });
      } catch (error) {
      }
    };

    loadProducts();
    
    const handleAuthStateChanged = (): void => {
      setTimeout(() => {
        const appId = getAppId();
        if (!appId) {
          return;
        }
        const currentUser = authService.getCurrentUser();
        presenter
          .present({
            appId,
            userId: currentUser?.userId || undefined,
          })
          .catch(() => {
          });
      }, 100);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('authStateChanged', handleAuthStateChanged);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('authStateChanged', handleAuthStateChanged);
      }
    };
  }, [presenter, authService]);

  const handleBuyProduct = async (product: Product): Promise<void> => {
    const productId = product.id.value;


    try {
      setLoadingProducts(prev => new Set(prev).add(productId));

      await presenter.onBuyProduct(productId);

    } catch {
      setLoadingProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  if (viewModel.status === 'loading') {
    return (
      <div className={className} style={style} dir="ltr">
        <h2 className="text-white text-xl font-bold mb-4">{viewModel.labels.productsTitle}</h2>
        <Grid>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="@container">
              <OfferCardSkeleton />
            </div>
          ))}
        </Grid>
      </div>
    );
  }

  if (viewModel.status === 'error') {
    return (
      <div className={className} style={style} dir="ltr">
        <h2 className="text-white text-xl font-bold mb-4">{viewModel.labels.productsTitle}</h2>
        <div className="text-white">Error: {viewModel.message}</div>
      </div>
    );
  }

  if (viewModel.products.length === 0) {
    return null;
  }

  return (
    <div className={`${className || ''} mt-8`} style={style} dir="ltr">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">{viewModel.labels.productsTitle}</h2>
      </div>
      <Grid>
        {Array.isArray(viewModel.products) ? viewModel.products.map((product, index) => (
          <div key={product?.id?.value || `product-${index}`} className="@container" style={{ height: '100%' }}>
            <OfferCard
              mainImage={product.mainImage}
              mainImageAlt={product.mainImageAlt}
              sideImage={product.sideImage}
              includedItems={product.includedItems}
              discount={product.discount}
              playerLimit={product.playerLimit}
              timer={product.timer ? product.timer.toLocaleString() : undefined}
              title={product.title}
              rarity={product.rarity}
              rpBonus={product.rpBonus}
              lpBonus={product.lpBonus}
              isPurchased={product.isPurchased}
              isLoading={loadingProducts.has(product.id.value)}
              buyButton={{
                text: product.isPurchased 
                  ? viewModel.labels.outOfStock 
                  : (product.price?.format() || viewModel.labels.buyButton),
                enabled: !product.isPurchased,
                style: product.buyButton?.style
              }}
              onClick={() => handleBuyProduct(product)}
            />
          </div>
        )) : (
          <div className="text-white">No products available</div>
        )}
      </Grid>
    </div>
  );
}
