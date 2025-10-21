import { Product } from '../../domain/types';

export interface ProductsListViewModel {
  readonly status: 'loading' | 'success' | 'error';
  readonly products: Product[];
  readonly message?: string;
}

