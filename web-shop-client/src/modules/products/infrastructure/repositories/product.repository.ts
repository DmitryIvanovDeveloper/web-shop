import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';

@injectable()
export class ProductRepository implements ProductRepositoryPort {
  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async getAll(): Promise<Product[]> {
    console.log('[ProductRepository] Fetching all products...');
    
    try {
      const response = await this.http.get<Product[]>('/api/products/list');
      console.log('[ProductRepository] Response received:', response);
      
      console.log('[ProductRepository] Products extracted:', response.data.length);
      
      return response.data;
    } catch (error) {
      console.error('[ProductRepository] Failed to fetch products:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Product | null> {
    console.log('[ProductRepository] Fetching product by id:', id);
    
    try {
      const response = await this.http.get<Product>(`/api/products/list/${id}`);
      console.log('[ProductRepository] Product response:', response);
      
      return response.data || null;
    } catch (error) {
      console.error('[ProductRepository] Failed to fetch product:', error);
      return null;
    }
  }
}
