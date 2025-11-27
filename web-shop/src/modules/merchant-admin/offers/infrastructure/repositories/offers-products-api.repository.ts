import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES, TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { Product, ProductQueryServicePort } from '../../application/ports/product-query-service.port';

interface ProductsApiResponse {
  products: Product[];
}

@injectable()
export class OffersProductsApiRepository implements ProductQueryServicePort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly _http: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async loadProducts(appId: string): Promise<Result<readonly Product[], Error>> {
    try {
      const response = await this._http.get<ProductsApiResponse>(`/api/products?appId=${encodeURIComponent(appId)}`);

      if (response.status !== 200) {
        this._logger.error('[OffersProductsApiRepository] Failed to load products', {
          status: response.status,
          appId,
        });
        return Result.error(new Error(`Failed to load products: ${response.statusText}`));
      }

      const products = response.data?.products ?? [];
      return Result.ok(products);
    } catch (error) {
      this._logger.error('[OffersProductsApiRepository] Unexpected load error', { error, appId });
      return Result.error(error as Error);
    }
  }
}











