import { Product } from '../../domain/entities/product.entity';

export interface ProductViewModel {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  discount?: number;
  icon?: string;
  categoryLabel?: string;
  rp?: number;
  lp?: number;
}

export interface ProductListViewModel {
  status: 'idle' | 'loading' | 'success' | 'error';
  products: ProductViewModel[];
  error?: string;
}
