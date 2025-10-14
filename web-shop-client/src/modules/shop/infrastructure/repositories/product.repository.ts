import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundError, ShopError } from '../../domain/errors/shop.error';
import type { GetProductsRequest, ProductData } from '../../domain/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class ProductRepository implements ProductRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient) private readonly httpClient: HttpClient
  ) {}

  async getProducts(request: GetProductsRequest): Promise<Result<Product[], ShopError>> {
    try {
      const response = await this.httpClient.get<ProductData[]>('/api/shop/products');

      if (response.status !== 200) {
        return Result.error(new ShopError('Failed to fetch products'));
      }

      let products = response.data;

      // Фильтрация по категории если указана
      if (request.category) {
        products = products.filter(p => p.category === request.category);
      }

      // Лимит результатов если указан
      if (request.limit) {
        products = products.slice(0, request.limit);
      }

      // Создание Product entities
      const productEntities: Product[] = [];
      for (const data of products) {
        const result = Product.create(data);
        if (result.isSuccess()) {
          productEntities.push(result.data);
        }
      }

      return Result.ok(productEntities);
    } catch (error) {
      return Result.error(new ShopError(`Error loading products: ${error}`));
    }
  }

  async getProductById(id: string): Promise<Result<Product, ShopError>> {
    try {
      const response = await this.httpClient.get<ProductData[]>('/api/shop/products');

      if (response.status !== 200) {
        return Result.error(new ShopError('Failed to fetch product'));
      }

      const productData = response.data.find(p => p.id === id);

      if (!productData) {
        return Result.error(new ProductNotFoundError(id));
      }

      const result = Product.create(productData);
      return result;
    } catch (error) {
      return Result.error(new ShopError(`Error loading product: ${error}`));
    }
  }
}
