import { injectable, inject } from 'inversify';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PurchaseRepositoryPort } from '../ports/purchase-repository.port';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Get Purchased Products Use Case
 * 
 * Business logic for retrieving purchased product IDs for a user
 * Delegates to purchase repository for data access
 */
@injectable()
export class GetPurchasedProductsUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PRODUCTS_TYPES.PurchaseRepository)
    private readonly _purchaseRepository: PurchaseRepositoryPort
  ) {}

  /**
   * Execute the use case
   */
  public async execute(userId: string, appId: string): Promise<string[]> {
    // If no userId, return empty array (user not authorized)
    if (!userId) {
      this._logger.info('[GetPurchasedProductsUseCase] No userId provided, returning empty purchased list');
      return [];
    }

    this._logger.info('[GetPurchasedProductsUseCase] Getting purchased products', { userId, appId });

    try {
      const purchasedProductIds = await this._purchaseRepository.getPurchasedProductIds(userId, appId);
      
      this._logger.info('[GetPurchasedProductsUseCase] Purchased products retrieved', { 
        userId,
        appId,
        count: purchasedProductIds.length,
        productIds: purchasedProductIds 
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
