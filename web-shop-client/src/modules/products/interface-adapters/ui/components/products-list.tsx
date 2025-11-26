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
      console.log('[ProductsList] Using appId from user session:', currentUser.appId);
      return currentUser.appId;
    }

    // 2. Fallback to query parameters
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const appIdFromQuery = searchParams.get('appId');
      if (appIdFromQuery) {
        console.log('[ProductsList] Using appId from query params:', appIdFromQuery);
        return appIdFromQuery;
      }
    }

    console.log('[ProductsList] No appId found in session or query');
    return null;
  };

  useEffect(() => {
    // Subscribe to presenter updates
    presenter.setOnViewModelChanged(() => {
      console.log('[ProductsList] ViewModel changed, updating UI');
      forceUpdate({});
    });

    // Initial load with appId from session or query
    // Wait a bit for session restoration to complete
    const loadProducts = async () => {
      try {
        // Small delay to allow session restoration to complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const appId = getAppId();
        if (!appId) {
          console.log('[ProductsList] No appId available, skipping product load (will wait for authStateChanged event)');
          // Don't load products if no appId (prevents showing all products)
          // Products will be loaded when authStateChanged event fires after session restoration
          return;
        }
        console.log('[ProductsList] Loading products with appId:', appId);
        const currentUser = authService.getCurrentUser();
        await presenter.present({ 
          appId,
          userId: currentUser?.userId || undefined
        });
      } catch (error) {
        console.error('[ProductsList] Failed to load products:', error);
      }
    };

    loadProducts();
    
    // Listen for auth state changes (e.g., session restored from localStorage)
    const handleAuthStateChanged = () => {
      console.log('[ProductsList] Auth state changed (e.g., session restored), reloading products');
      // Small delay to ensure AuthPresenter has updated its state
      setTimeout(() => {
        const appId = getAppId();
        if (!appId) {
          console.log('[ProductsList] Auth state changed but no appId, skipping reload');
          return;
        }
        const currentUser = authService.getCurrentUser();
        presenter.present({ 
          appId,
          userId: currentUser?.userId || undefined
        }).catch((error) => {
          console.error('[ProductsList] Failed to reload products after auth state change:', error);
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
