import { injectable, inject } from 'inversify';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PurchaseRepositoryPort } from '../ports/purchase-repository.port';
import type { Logger } from '../../../../application/ports/logger.port';


@injectable()
export class GetPurchasedProductsUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PRODUCTS_TYPES.PurchaseRepository)
    private readonly _purchaseRepository: PurchaseRepositoryPort
  ) {}

  
  public async execute(userId: string, appId: string): Promise<string[]> {
        if (!userId) {
      this._logger.info('[GetPurchasedProductsUseCase] No userId provided, returning empty purchased list');
      return [];
    }

    this._logger.info('[GetPurchasedProductsUseCase] Getting purchased products', { userId, appId });

    try {
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const purchasedProductIds = await this._purchaseRepository.getPurchasedProductIds(userId, appId);
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      
      this._logger.info('[GetPurchasedProductsUseCase] Purchased products retrieved', { 
        userId,
        appId,
        count: purchasedProductIds.length,
        productIds: purchasedProductIds,
        durationMs: Math.round(end - start)
      });

      return purchasedProductIds;
    } catch (error) {
      this._logger.error('[GetPurchasedProductsUseCase] Failed to get purchased products', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        appId
      });
      throw error;
    }
  }
}