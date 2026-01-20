import type { Product } from '../../domain/types';


export interface ProductStoragePort {
  
  getAll(): Promise<Product[]>;

  
  getById(id: string): Promise<Product | null>;
}
