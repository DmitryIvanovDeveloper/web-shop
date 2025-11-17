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

export interface ProductsListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ProductsList({ className, style }: ProductsListProps): JSX.Element | null {
  const [, forceUpdate] = useState({});
  
  // State for tracking loading status of individual products
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());

  // Get presenter from DI container
  const presenter = container.get<ProductsListPresenter>(PRODUCTS_TYPES.ProductsListPresenter);

  // Get appId from URL query parameters
  const getAppIdFromQuery = (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('appId');
  };

  useEffect(() => {
    // Subscribe to presenter updates
    presenter.setOnViewModelChanged(() => {
      console.log('[ProductsList] ViewModel changed, updating UI');
      forceUpdate({});
    });

    // Initial load with appId from URL
    const loadProducts = async () => {
      try {
        const appId = getAppIdFromQuery();
        console.log('[ProductsList] Loading products with appId from URL:', appId);
        await presenter.present({ appId: appId || undefined });
      } catch (error) {
        console.error('[ProductsList] Failed to load products:', error);
      }
    };

    loadProducts();
    
    // Listen for URL changes (e.g., appId parameter changes)
    const handlePopState = () => {
      const appId = getAppIdFromQuery();
      console.log('[ProductsList] URL changed, reloading products with appId:', appId);
      loadProducts();
    };
    
    // Слушать событие от ProductsUserAuthenticatedHandler
    // Handler уже вызвал presenter.present() с данными из события
    // Presenter обновит ViewModel и уведомит UI через callback
    const handleAuthReload = () => {
      console.log('[ProductsList] Auth changed, presenter will update');
      const appId = getAppIdFromQuery();
      presenter.present({ appId: appId || undefined }).catch((error) => {
        console.error('[ProductsList] Failed to reload products after auth:', error);
      });
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('productsNeedReload', handleAuthReload);
      window.addEventListener('popstate', handlePopState);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('productsNeedReload', handleAuthReload);
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, [presenter]);

  const viewModel = presenter.getViewModel();

  const handleBuyProduct = async (product: Product) => {
    const productId = product.id.value;
    
    try {
      console.log('[ProductsList] Buy product clicked:', productId);
      
      // Set loading state for this product
      setLoadingProducts(prev => new Set(prev).add(productId));
      
      // Pass only product ID to presenter (convert ProductId to string)
      await presenter.onBuyProduct(productId);
      
      console.log('[ProductsList] Product buy handled successfully:', productId);
      // Loading state will be cleared after redirect (component unmounts)
    } catch (error) {
      console.error('[ProductsList] Failed to handle buy product:', error);
      
      // Clear loading state on error
      setLoadingProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  if (viewModel.status === 'loading') {
    console.log('[ProductsList] Rendering loading state with skeletons');
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
    console.log('[ProductsList] Rendering error state:', viewModel.message);
    return (
      <div className={className} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">Products</h2>
        <div className="text-white">Error: {viewModel.message}</div>
      </div>
    );
  }

  if (viewModel.products.length === 0) {
    console.log('[ProductsList] No products to render, returning null');
    return null;
  }

  console.log('[ProductsList] Products data:', viewModel.products);
  console.log('[ProductsList] First product:', viewModel.products[0]);

      console.log('[ProductsList] Rendering products:', viewModel.products);
      return (
        <div className={`${className || ''} mt-8`} style={style}>
          <h2 className="text-white text-xl font-bold mb-4">Products</h2>
          <Grid>
            {Array.isArray(viewModel.products) ? viewModel.products.map((product, index) => (
          <div key={product?.id?.value || `product-${index}`} className="@container">
            <OfferCard 
            mainImage={product.mainImage}
            mainImageAlt={product.mainImageAlt}
            sideImage={product.sideImage}
            backgroundImage={product.backgroundImage}
            includedItems={product.includedItems}
            discount={product.discount}
            playerLimit={product.playerLimit}
            timer={product.timer}
            title={product.title}
            titleStyle={product.titleStyle}
            rarity={product.rarity}
            originalPrice={product.originalPrice?.format()}
            currentPrice={product.currentPrice?.format()}
            rpBonus={product.rpBonus}
            lpBonus={product.lpBonus}
            isPurchased={product.isPurchased}
            isLoading={loadingProducts.has(product.id.value)}
            buyButton={{
              text: product.currentPrice?.format() || product.originalPrice?.format() || 'BUY NOW',
              enabled: !product.isPurchased,
              style: product.buyButton?.style
            }}
            onClick={() => !product.isPurchased && handleBuyProduct(product)}
            />
          </div>
          )) : (
            <div className="text-white">No products available</div>
          )}
        </Grid>
      </div>
    );
}
