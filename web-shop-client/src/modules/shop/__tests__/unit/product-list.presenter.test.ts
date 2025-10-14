import { describe, it, expect } from 'vitest';
import { ProductListPresenter } from '../../interface-adapters/presenters/product-list.presenter';
import { Product } from '../../domain/entities/product.entity';
import { ShopError } from '../../domain/errors/shop.error';
import { Result } from '../../../../shared/domain/result/result';

describe('ProductListPresenter', () => {
  const presenter = new ProductListPresenter();

  it('should present success state', () => {
    const product = Product.create({
      id: 'prod-001',
      name: 'Test Product',
      description: 'Test',
      price: 100,
      imageUrl: '/test.png',
      category: 'weapons',
      inStock: true
    });

    const result = Result.ok([product.data]);
    const viewModel = presenter.present(result);

    expect(viewModel.status).toBe('success');
    expect(viewModel.products.length).toBe(1);
    expect(viewModel.products[0].price).toBe('100 💎');
  });

  it('should present error state', () => {
    const result = Result.error(new ShopError('Test error'));
    const viewModel = presenter.present(result);

    expect(viewModel.status).toBe('error');
    expect(viewModel.products.length).toBe(0);
    expect(viewModel.error).toBe('Test error');
  });

  it('should present loading state', () => {
    const viewModel = presenter.presentLoading();

    expect(viewModel.status).toBe('loading');
    expect(viewModel.products.length).toBe(0);
  });
});
