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
  
  // State for tracking loading status of individual products
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());

  // Get presenter and auth service from DI container
  const presenter = container.get<ProductsListPresenter>(PRODUCTS_TYPES.ProductsListPresenter);
  const authService = container.get<AuthServicePort>(PRODUCTS_TYPES.AuthService);

  // Get appId with priority: session > query params
  const getAppId = (): string | null => {
    // 1. First try to get from authenticated user session
    const currentUser = authService.getCurrentUser();
    if (currentUser?.appId) {
      return currentUser.appId;
    }

    // 2. Fallback to query parameters
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      // Support both 'appId' and 'app' query parameters
      const appIdFromQuery = searchParams.get('appId') || searchParams.get('app');
      if (appIdFromQuery) {
        return appIdFromQuery;
      }
    }

    // 3. Fallback to environment default (for direct /store access without query)
    const envAppId = process.env.NEXT_PUBLIC_APP_ID || null;
    if (envAppId) {
      return envAppId;
    }
    return null;
  };

  useEffect(() => {
    // Subscribe to presenter updates
    presenter.setOnViewModelChanged(() => {
      forceUpdate({});
    });

    // Initial load with appId from session or query
    // Wait a bit for session restoration to complete
    const loadProducts = async () => {
      try {
        // Small delay to allow session restoration to complete
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

        console.log('[ProductsList] Products loaded successfully');
      } catch (error) {
        console.error('[ProductsList] Failed to load products:', error);
      }
    };

    loadProducts();
    
    // Listen for auth state changes (e.g., session restored from localStorage)
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
            // Presenter already logs failures
          });
      }, 100);
    };
    
    if (typeof window !== 'undefined') {
      // We rely on presenter caching products; authStateChanged will refresh only purchased state.
      window.addEventListener('authStateChanged', handleAuthStateChanged);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('authStateChanged', handleAuthStateChanged);
      }
    };
  }, [presenter, authService]);

  const viewModel = presenter.getViewModel();

  const handleBuyProduct = async (product: Product): Promise<void> => {
    const productId = product.id.value;


    try {
      // Set loading state for this product (spinner will stay active)
      setLoadingProducts(prev => new Set(prev).add(productId));

      // Pass only product ID to presenter (convert ProductId to string)
      await presenter.onBuyProduct(productId);

      // Don't clear loading state on success - spinner stays active until redirect
    } catch {
      // Clear loading state only on error
      setLoadingProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  if (viewModel.status === 'loading') {
    return (
      <div className={className} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">Products</h2>
        <Grid>
          {/* Show 6 skeleton cards while loading */}
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
      <div className={className} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">Products</h2>
        <div className="text-white">Error: {viewModel.message}</div>
      </div>
    );
  }

  if (viewModel.products.length === 0) {
    return null;
  }

  return (
    <div className={`${className || ''} mt-8`} style={style}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">Products</h2>
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
                text: product.currentPrice?.format() || product.originalPrice?.format() || 'BUY NOW',
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
