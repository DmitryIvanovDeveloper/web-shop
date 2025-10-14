import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { bindShop } from '../../infrastructure/bootstrap/bind.shop';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { HttpClient } from '../../../../application/ports/http-client.port';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

describe('Product Detail Data Flow', () => {
  let container: Container;
  let repository: ProductRepositoryPort;

  beforeEach(() => {
    container = new Container();
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    bindShop(container);
    repository = container.get<ProductRepositoryPort>(SHOP_TYPES.ProductRepository);
  });

  it('should load product details by id', async () => {
    // 1. User clicks on product
    const productId = 'prod-001';

    // 2. System loads product details
    const result = await repository.getProductById(productId);

    // 3. Product details are displayed
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.data.id).toBe(productId);
      expect(result.data.name).toBeDefined();
      expect(result.data.description).toBeDefined();
    }
  });

  it('should handle non-existent product', async () => {
    // 1. User tries to access invalid product
    const productId = 'invalid-id';

    // 2. System attempts to load product
    const result = await repository.getProductById(productId);

    // 3. Error is handled gracefully
    expect(result.isFailure()).toBe(true);
  });
});
