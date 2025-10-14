import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { HttpClient } from '../../../../application/ports/http-client.port';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

describe('ProductRepository Integration', () => {
  let container: Container;
  let repository: ProductRepositoryPort;

  beforeEach(() => {
    container = new Container();
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    container.bind<ProductRepositoryPort>(SHOP_TYPES.ProductRepository).to(ProductRepository);
    repository = container.get<ProductRepositoryPort>(SHOP_TYPES.ProductRepository);
  });

  it('should load products from mock JSON', async () => {
    const result = await repository.getProducts({});

    expect(result.isSuccess()).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].name).toBeDefined();
  });

  it('should filter products by category', async () => {
    const result = await repository.getProducts({ category: 'weapons' });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      result.data.forEach(product => {
        expect(product.category).toBe('weapons');
      });
    }
  });

  it('should limit number of products', async () => {
    const result = await repository.getProducts({ limit: 2 });

    expect(result.isSuccess()).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(2);
  });

  it('should get product by id', async () => {
    const result = await repository.getProductById('prod-001');

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.data.id).toBe('prod-001');
    }
  });

  it('should return error for non-existent product', async () => {
    const result = await repository.getProductById('non-existent');

    expect(result.isFailure()).toBe(true);
  });
});
