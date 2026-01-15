import { Product } from '../../domain/types';

export interface ProductsLabels {
  buyButton: string;
  addToCart: string;
  outOfStock: string;
  loadingProducts: string;
  errorLoadingProducts: string;
  productsTitle: string;
}

export interface ProductsListViewModel {
  readonly status: 'loading' | 'success' | 'error';
  readonly products: Product[];
  readonly message?: string;
  readonly labels: ProductsLabels;
}

