import type { Product } from '../../domain/types';

/**
 * Product Storage Port
 * 
 * Interface for product data storage operations
 * Abstracts data access layer from business logic
 */
export interface ProductStoragePort {
  /**
   * Get all products from storage
   */
  getAll(): Promise<Product[]>;

  /**
   * Get product by ID from storage
   */
  getById(id: string): Promise<Product | null>;
}
