import { injectable } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';

@injectable()
export class ProductRepository implements ProductRepositoryPort {
  async getAll(): Promise<Product[]> {
    console.log('[ProductRepository] Loading products from mock data...');
    
    try {
      // Загружаем данные из JSON файла
      const response = await fetch('/mocks/api/products/products.json');
      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status}`);
      }
      
      const products = await response.json();
      console.log('[ProductRepository] Products loaded:', products.length);
      
      return products;
    } catch (error) {
      console.error('[ProductRepository] Failed to load products:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Product | null> {
    console.log('[ProductRepository] Fetching product by id:', id);
    
    try {
      const products = await this.getAll();
      const product = products.find(p => p.id === id);
      
      console.log('[ProductRepository] Product found:', !!product);
      return product || null;
    } catch (error) {
      console.error('[ProductRepository] Failed to fetch product:', error);
      return null;
    }
  }
}
