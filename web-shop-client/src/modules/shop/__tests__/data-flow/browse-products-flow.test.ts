import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { bindShop } from '../../infrastructure/bootstrap/bind.shop';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { ProductListPresenter } from '../../interface-adapters/presenters/product-list.presenter';
import { HttpClient } from '../../../../application/ports/http-client.port';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

describe('Browse Products Data Flow', () => {
  let container: Container;
  let useCase: GetProductsUseCase;
  let presenter: ProductListPresenter;

  beforeEach(() => {
    container = new Container();
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    bindShop(container);
    useCase = container.get<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase);
    presenter = container.get<ProductListPresenter>(SHOP_TYPES.ProductListPresenter);
  });

  it('should complete full data flow: User -> UI -> UseCase -> Repository -> Presenter -> UI', async () => {
    // 1. User opens shop page (idle state)
    let viewModel = presenter.presentIdle();
    expect(viewModel.status).toBe('idle');

    // 2. UI triggers loading
    viewModel = presenter.presentLoading();
    expect(viewModel.status).toBe('loading');

    // 3. UseCase fetches products from repository
    const result = await useCase.execute({});
    expect(result.isSuccess()).toBe(true);

    // 4. Presenter transforms to ViewModel
    viewModel = presenter.present(result);
    expect(viewModel.status).toBe('success');
    expect(viewModel.products.length).toBeGreaterThan(0);

    // 5. UI displays products
    expect(viewModel.products[0]).toHaveProperty('name');
    expect(viewModel.products[0]).toHaveProperty('price');
    expect(viewModel.products[0].price).toContain('💎');
  });

  it('should handle category filter flow', async () => {
    // 1. User selects "weapons" category
    const categoryFilter = 'weapons';

    // 2. UseCase applies filter
    const result = await useCase.execute({ category: categoryFilter });

    // 3. Presenter shows filtered results
    const viewModel = presenter.present(result);

    expect(viewModel.status).toBe('success');
    if (viewModel.products.length > 0) {
      viewModel.products.forEach(product => {
        expect(product.category).toBe(categoryFilter);
      });
    }
  });

  it('should handle error flow', async () => {
    // Simulate error by requesting invalid data
    const result = await useCase.execute({ limit: -1 });

    const viewModel = presenter.present(result);

    // Error should be handled gracefully
    expect(viewModel.status).toBe('error' || 'success');
  });

  it('should validate product data integrity through full flow', async () => {
    const result = await useCase.execute({});
    const viewModel = presenter.present(result);

    expect(viewModel.status).toBe('success');

    // Check data integrity
    viewModel.products.forEach(product => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.description).toBeDefined();
      expect(product.price).toMatch(/\d+ 💎/);
      expect(product.category).toBeDefined();
      expect(typeof product.inStock).toBe('boolean');
    });
  });
});
