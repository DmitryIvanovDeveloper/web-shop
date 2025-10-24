import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Supabase Purchase Repository Implementation
 * 
 * Infrastructure implementation of PurchaseRepositoryPort using Supabase
 * Handles purchase history operations through Supabase API
 */
@injectable()
export class SupabasePurchaseRepository implements PurchaseRepositoryPort {
  private readonly _supabase: SupabaseClient;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    this._supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async getPurchasedProductIds(userId: string, appId: string): Promise<string[]> {
    try {
      this._logger.info('[SupabasePurchaseRepository] Loading purchased products', { userId, appId });

      const { data, error } = await this._supabase
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

      const productIds = data?.map(item => item.product_id).filter(Boolean) || [];
      
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
}
