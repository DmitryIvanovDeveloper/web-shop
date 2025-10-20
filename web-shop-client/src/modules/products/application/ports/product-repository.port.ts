import { Product } from '../../domain/types';

export interface ProductRepositoryPort {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
}
