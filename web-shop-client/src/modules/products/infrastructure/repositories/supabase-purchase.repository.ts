import { injectable, inject } from 'inversify';
import { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DatabaseClientPort } from '../../../../application/ports/database-client.port';

/**
 * Supabase Purchase Repository Implementation
 * 
 * Infrastructure implementation of PurchaseRepositoryPort using Supabase
 * Handles purchase history operations through Supabase API
 * Uses shared DatabaseClientPort for Supabase access
 */
@injectable()
export class SupabasePurchaseRepository implements PurchaseRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(ROOT_TYPES.DatabaseClient)
    private readonly _databaseClient: DatabaseClientPort
  ) {}

  public async getPurchasedProductIds(userId: string, appId: string): Promise<string[]> {
    try {
      this._logger.info('[SupabasePurchaseRepository] Loading purchased products', { userId, appId });

      const { data, error } = await this._databaseClient
        .from('transaction_log')
        .select('product_id')
        .eq('user_id', userId)
        .eq('app_id', appId)
        .eq('payment_status', 'succeeded');

      if (error) {
        this._logger.error('[SupabasePurchaseRepository] Failed to load purchased products', {
          error,
          userId,
          appId
        });
        throw new Error(`Failed to load purchased products: ${error.message}`);
      }

      const productIds =
        data
          ?.map((item: { product_id: string | null }) => item.product_id)
          .filter((productId: string | null): productId is string => typeof productId === 'string' && productId.length > 0) ||
        [];

      this._logger.info('[SupabasePurchaseRepository] Purchased products loaded', {
        userId,
        appId,
        count: productIds.length,
        productIds
      });

      return productIds;
    } catch (error) {
      this._logger.error('[SupabasePurchaseRepository] Unexpected error loading purchased products', {
        error,
        userId,
        appId
      });
      throw error;
    }
  }

  public async getProductPurchaseCounts(appId: string): Promise<Map<string, number>> {
    try {
      this._logger.info('[SupabasePurchaseRepository] Loading product purchase counts', { appId });

      const { data, error } = await this._databaseClient
        .from('transaction_log')
        .select('product_id')
        .eq('app_id', appId)
        .eq('payment_status', 'succeeded');

      if (error) {
        this._logger.error('[SupabasePurchaseRepository] Failed to load product purchase counts', {
          error,
          appId
        });
        throw new Error(`Failed to load product purchase counts: ${error.message}`);
      }

      // Count purchases per product
      const purchaseCounts = new Map<string, number>();
      data?.forEach((item: { product_id: string | null }) => {
        const productId = item.product_id;
        if (typeof productId === 'string' && productId.length > 0) {
          purchaseCounts.set(productId, (purchaseCounts.get(productId) || 0) + 1);
        }
      });

      this._logger.info('[SupabasePurchaseRepository] Product purchase counts loaded', {
        appId,
        productCount: purchaseCounts.size,
        counts: Object.fromEntries(purchaseCounts)
      });

      return purchaseCounts;
    } catch (error) {
      this._logger.error('[SupabasePurchaseRepository] Unexpected error loading product purchase counts', {
        error,
        appId
      });
      throw error;
    }
  }
}
