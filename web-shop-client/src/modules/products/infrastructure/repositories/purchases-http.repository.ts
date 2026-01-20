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

  public async getProductPurchaseCounts(appId: string): Promise<Map<string, number>> {
    if (!appId) {
      this._logger.info('[PurchasesHttpRepository] Empty appId, returning empty map', {
        appId,
      });
      return new Map();
    }

    const url = `/api/purchases/counts?${new URLSearchParams({
      appId,
    }).toString()}`;

    this._logger.info('[PurchasesHttpRepository] Loading purchase counts via HTTP', { url });

    const response = await this._httpClient.get<{ counts: Record<string, number> }>(url);

    if (response.status !== 200) {
      this._logger.error('[PurchasesHttpRepository] Failed to load purchase counts', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(response.statusText || 'Failed to load purchase counts');
    }

    const data = response.data;
    const counts = data?.counts || {};

        const purchaseCounts = new Map<string, number>();
    Object.entries(counts).forEach(([productId, count]) => {
      purchaseCounts.set(productId, count);
    });

    this._logger.info('[PurchasesHttpRepository] Purchase counts loaded from HTTP', {
      count: purchaseCounts.size,
    });

    return purchaseCounts;
  }
}




















