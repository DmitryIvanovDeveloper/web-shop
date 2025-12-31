import { inject, injectable } from 'inversify';
import type { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES, ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PurchasesApiResponseDto } from '../dtos/product.dto';

@injectable()
export class PurchasesHttpRepository implements PurchaseRepositoryPort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async getPurchasedProductIds(userId: string, appId: string): Promise<string[]> {
    if (!userId || !appId) {
      this._logger.info('[PurchasesHttpRepository] Empty userId or appId, returning empty list', {
        userId,
        appId,
      });
      return [];
    }

    const url = `/api/purchases?${new URLSearchParams({
      userId,
      appId,
    }).toString()}`;

    this._logger.info('[PurchasesHttpRepository] Loading purchases via HTTP', { url });

    const response = await this._httpClient.get<PurchasesApiResponseDto>(url);

    if (response.status !== 200) {
      this._logger.error('[PurchasesHttpRepository] Failed to load purchases', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(response.statusText || 'Failed to load purchases');
    }

    const data = response.data;
    const productIds = Array.isArray(data?.productIds) ? data.productIds : [];

    this._logger.info('[PurchasesHttpRepository] Purchases loaded from HTTP', {
      count: productIds.length,
    });

    return productIds;
  }
}



















