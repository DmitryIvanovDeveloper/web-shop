import { injectable, inject } from 'inversify';
import { TranslationsConfigHandler } from '../../../shared/handlers/translations-config.handler';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ProductsListPresenter } from '../presenters/products-list.presenter';

@injectable()
export class ProductsTranslationsConfigHandler extends TranslationsConfigHandler {
  constructor(
    @inject(PRODUCTS_TYPES.ProductsListPresenter)
    private readonly _productsPresenter: ProductsListPresenter
  ) {
    super();
  }

  protected async onTranslationsConfig(
    translations: Record<string, string>,
    languageCode: string,
    direction: 'ltr' | 'rtl'
  ): Promise<void> {
    // Pass translations config to products presenter
    this._productsPresenter.onTranslationsConfig(translations, languageCode, direction);
  }
}

