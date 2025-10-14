import { injectable } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { Product } from '../../domain/entities/product.entity';
import { ShopError } from '../../domain/errors/shop.error';
import { ProductListViewModel, ProductViewModel } from '../view-models/product-list.view-model';

@injectable()
export class ProductListPresenter {
  present(result: Result<Product[], ShopError>): ProductListViewModel {
    if (result.isSuccess()) {
      const products: ProductViewModel[] = result.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: `${product.price} €`,
        originalPrice: product.originalPrice ? `${product.originalPrice} €` : undefined,
        imageUrl: product.imageUrl,
        category: product.category,
        inStock: product.inStock,
        discount: product.discount,
        icon: product.icon,
        categoryLabel: product.categoryLabel,
        rp: product.rp,
        lp: product.lp
      }));

      return {
        status: 'success',
        products
      };
    } else {
      return {
        status: 'error',
        products: [],
        error: result.error?.message || 'Failed to load products'
      };
    }
  }

  presentLoading(): ProductListViewModel {
    return {
      status: 'loading',
      products: []
    };
  }

  presentIdle(): ProductListViewModel {
    return {
      status: 'idle',
      products: []
    };
  }
}
