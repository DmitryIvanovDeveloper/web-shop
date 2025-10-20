'use client';
import { useEffect, useState } from 'react';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import { Grid } from '../../../../../shared/components/molecules/grid';
import { Product } from '../../domain/types';
import { ProductsListViewModel } from '../../view-models/products-list.view-model';

export interface ProductsListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ProductsList({ className, style }: ProductsListProps): JSX.Element | null {
  const [viewModel, setViewModel] = useState<ProductsListViewModel>({
    status: 'loading',
    products: []
  });

  useEffect(() => {
    console.log('[ProductsList] Component mounted, loading products...');
    
    const loadProducts = async () => {
      try {
        console.log('[ProductsList] Fetching products from API...');
        const response = await fetch('/api/products/list');
        const data = await response.json();
        console.log('[ProductsList] API response:', data);
        
        const products = Array.isArray(data) ? data : [];
        console.log('[ProductsList] Products extracted:', products.length);
        
        setViewModel({
          status: 'success',
          products,
          message: `Loaded ${products.length} products`
        });
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
  }, []);

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
        {viewModel.products.map((product, index) => (
          <OfferCard key={product?.id || `product-${index}`} {...product} />
        ))}
      </Grid>
    </div>
  );
}
