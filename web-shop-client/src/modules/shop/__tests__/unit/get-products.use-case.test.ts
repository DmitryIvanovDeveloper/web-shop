import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { Product } from '../../domain/entities/product.entity';
import { ShopError } from '../../domain/errors/shop.error';
import { Result } from '../../../../shared/domain/result/result';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';

class MockProductRepository implements ProductRepositoryPort {
  async getProducts() {
    const product = Product.create({
      id: 'prod-001',
      name: 'Test Product',
      description: 'Test',
      price: 100,
      imageUrl: '/test.png',
      category: 'weapons',
      inStock: true
    });
    return Result.ok([product.data]);
  }

  async getProductById(id: string) {
    const product = Product.create({
      id,
      name: 'Test Product',
      description: 'Test',
      price: 100,
      imageUrl: '/test.png',
      category: 'weapons',
      inStock: true
    });
    return Result.ok(product.data);
  }
}

describe('GetProductsUseCase', () => {
  let container: Container;
  let useCase: GetProductsUseCase;

  beforeEach(() => {
    container = new Container();
    container.bind<ProductRepositoryPort>(SHOP_TYPES.ProductRepository).to(MockProductRepository);
    container.bind<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase).to(GetProductsUseCase);
    useCase = container.get<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase);
  });

  it('should get products successfully', async () => {
    const result = await useCase.execute({});

    expect(result.isSuccess()).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should filter by category', async () => {
    const result = await useCase.execute({ category: 'weapons' });

    expect(result.isSuccess()).toBe(true);
  });
});
