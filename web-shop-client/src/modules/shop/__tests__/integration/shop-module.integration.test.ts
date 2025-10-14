import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { bindShop } from '../../infrastructure/bootstrap/bind.shop';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { ProductListPresenter } from '../../interface-adapters/presenters/product-list.presenter';
import { HttpClient } from '../../../../application/ports/http-client.port';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

describe('Shop Module Integration', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    bindShop(container);
  });

  it('should resolve GetProductsUseCase from container', () => {
    const useCase = container.get<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase);
    expect(useCase).toBeDefined();
  });

  it('should resolve ProductListPresenter from container', () => {
    const presenter = container.get<ProductListPresenter>(SHOP_TYPES.ProductListPresenter);
    expect(presenter).toBeDefined();
  });

  it('should execute full flow: UseCase -> Repository -> Presenter', async () => {
    const useCase = container.get<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase);
    const presenter = container.get<ProductListPresenter>(SHOP_TYPES.ProductListPresenter);

    const result = await useCase.execute({});
    const viewModel = presenter.present(result);

    expect(viewModel.status).toBe('success');
    expect(viewModel.products.length).toBeGreaterThan(0);
  });
});
