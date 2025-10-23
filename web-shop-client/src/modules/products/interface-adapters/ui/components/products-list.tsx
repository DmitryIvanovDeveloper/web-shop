'use client';
import { useEffect, useState } from 'react';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
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
  const [viewModel, setViewModel] = useState<ProductsListViewModel>({
    status: 'loading',
    products: []
  });
  
  // State for tracking loading status of individual products
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());

  // Get presenter from DI container
  const presenter = container.get<ProductsListPresenter>(PRODUCTS_TYPES.ProductsListPresenter);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const viewModel = await presenter.present();
        setViewModel(viewModel);
      } catch (error) {
        console.error('[ProductsList] Failed to load products:', error);
        setViewModel({
          status: 'error',
          products: [],
          message: error instanceof Error ? error.message : 'Failed to load products'
        });
      }
    };

    loadProducts();
  }, [presenter]);

  const handleBuyProduct = async (product: Product) => {
    const productId = product.id.value;
    
    try {
      console.log('[ProductsList] Buy product clicked:', productId);
      
      // Set loading state for this product (infinite loading)
      setLoadingProducts(prev => new Set(prev).add(productId));
      
      // Pass only product ID to presenter (convert ProductId to string)
      await presenter.onBuyProduct(productId);
      
      console.log('[ProductsList] Product buy handled successfully:', productId);
      // Note: Loading state is not cleared - it remains infinite
    } catch (error) {
      console.error('[ProductsList] Failed to handle buy product:', error);
      // Note: Loading state is not cleared even on error - it remains infinite
    }
  };

  if (viewModel.status === 'loading') {
    console.log('[ProductsList] Rendering loading state');
    return (
      <div className={className} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">Products</h2>
        <div className="text-white">Loading products...</div>
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
          <OfferCard 
            key={product?.id?.value || `product-${index}`} 
            mainImage={product.mainImage}
            mainImageAlt={product.mainImageAlt}
            sideImage={product.sideImage}
            backgroundImage={product.backgroundImage}
            includedItems={product.includedItems}
            discount={product.discount}
            playerLimit={product.playerLimit}
            timer={product.timer}
            title={product.title}
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
          )) : (
            <div className="text-white">No products available</div>
          )}
        </Grid>
      </div>
    );
}
