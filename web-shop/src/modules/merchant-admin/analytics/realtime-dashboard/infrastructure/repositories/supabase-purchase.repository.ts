import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PurchaseRepositoryPort, PurchaseRow } from '../../application/ports/purchase-repository.port';
import { PurchaseSummary } from '../../domain/entities/purchase-summary.entity';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../../application/ports/logger.port';
import { TrendDataPoint } from '../../domain/types/trend.types';
import { env } from '../../../../../../env';

/**
 * Supabase Purchase Repository Implementation
 * 
 * Infrastructure implementation of PurchaseRepositoryPort using Supabase
 * Handles purchase analytics operations through Supabase API
 */
@injectable()
export class SupabasePurchaseRepository implements PurchaseRepositoryPort {
  private readonly _supabase: SupabaseClient;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'SET' || supabaseKey === 'SET') {
      throw new Error('Supabase URL and Anon Key must be provided with real values, not "SET"');
    }

    this._supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async getPurchaseSummary(): Promise<PurchaseSummary> {
    try {
      this._logger.info('[SupabasePurchaseRepository] Loading purchase summary');

      // Получаем данные о покупках из таблицы транзакций
      const { data: transactions, error: transactionsError } = await this._supabase
        .from('transaction_log')
        .select('paid_amount, user_id, product_id, created_at, payment_status')
        .eq('payment_status', 'succeeded')
        .gte('created_at', this.getLast30DaysDate());

      if (transactionsError) {
        this._logger.error('[SupabasePurchaseRepository] Failed to load transactions', { 
          error: transactionsError
        });
        throw new Error(`Failed to load transactions: ${transactionsError.message}`);
      }

      // Получаем данные о продуктах для категоризации
      const { data: products, error: productsError } = await this._supabase
        .from('products')
        .select('id, rarity')
        .in('id', transactions?.map(t => t.product_id).filter(Boolean) || []);

      if (productsError) {
        this._logger.warn('[SupabasePurchaseRepository] Failed to load products data', { 
          error: productsError
        });
        // Продолжаем без данных о продуктах
      }

      // Вычисляем метрики
      const totalPurchases = this.calculateTotalPurchases(transactions || []);
      const uniqueCustomers = this.calculateUniqueCustomers(transactions || []);
      const averagePurchaseValue = this.calculateAveragePurchaseValue(transactions || []);
      const purchaseFrequency = this.calculatePurchaseFrequency(transactions || []);
      const topProductCategory = this.calculateTopProductCategory(transactions || [], products || []);
      const trend = await this.calculateTrend(transactions || []);

      const purchaseSummary = new PurchaseSummary(
        totalPurchases,
        uniqueCustomers,
        averagePurchaseValue,
        purchaseFrequency,
        topProductCategory,
        'USD', // Можно сделать конфигурируемым
        trend
      );

      this._logger.info('[SupabasePurchaseRepository] Purchase summary loaded', { 
        totalPurchases,
        uniqueCustomers,
        averagePurchaseValue,
        purchaseFrequency,
        topProductCategory
      });

      return purchaseSummary;
    } catch (error) {
      this._logger.error('[SupabasePurchaseRepository] Unexpected error loading purchase summary', { 
        error
      });
      throw error;
    }
  }

  private calculateTotalPurchases(transactions: any[]): number {
    return transactions.length;
  }

  private calculateUniqueCustomers(transactions: any[]): number {
    const uniqueUserIds = new Set(transactions.map(t => t.user_id).filter(Boolean));
    return uniqueUserIds.size;
  }

  private calculateAveragePurchaseValue(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    const totalValue = transactions.reduce((sum, transaction) => {
      return sum + (transaction.paid_amount || 0);
    }, 0);
    return totalValue / transactions.length;
  }

  private calculatePurchaseFrequency(transactions: any[]): number {
    const uniqueUserIds = new Set(transactions.map(t => t.user_id).filter(Boolean));
    if (uniqueUserIds.size === 0) return 0;
    return transactions.length / uniqueUserIds.size;
  }

  private calculateTopProductCategory(transactions: any[], products: any[]): string {
    if (products.length === 0) return 'Unknown';
    
    // Создаем мапу product_id -> rarity
    const productRarityMap = new Map();
    products.forEach(product => {
      productRarityMap.set(product.id, product.rarity);
    });

    // Подсчитываем количество покупок по редкости
    const rarityCount = new Map();
    transactions.forEach(transaction => {
      const rarity = productRarityMap.get(transaction.product_id) || 'Unknown';
      rarityCount.set(rarity, (rarityCount.get(rarity) || 0) + 1);
    });

    // Находим редкость с максимальным количеством покупок
    let topRarity = 'Unknown';
    let maxCount = 0;
    rarityCount.forEach((count, rarity) => {
      if (count > maxCount) {
        maxCount = count;
        topRarity = rarity;
      }
    });

    return topRarity;
  }

  private async calculateTrend(transactions: any[]): Promise<TrendDataPoint[]> {
    try {
      // Группируем транзакции по дням за последние 7 дней
      const last7Days = this.getLast7Days();
      const trendMap = new Map<string, number>();

      // Инициализируем все дни нулевыми значениями
      last7Days.forEach(date => {
        trendMap.set(date.toISOString().split('T')[0], 0);
      });

      // Суммируем покупки по дням
      transactions.forEach(transaction => {
        if (transaction.created_at) {
          const date = new Date(transaction.created_at);
          if (!isNaN(date.getTime())) {
            const dateKey = date.toISOString().split('T')[0];
            if (trendMap.has(dateKey)) {
              trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
            }
          }
        }
      });

      // Преобразуем в массив TrendDataPoint
      return Array.from(trendMap.entries())
        .map(([date, value]) => {
          const timestamp = new Date(date);
          return {
            timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
            value: value || 0
          };
        })
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      this._logger.warn('[SupabasePurchaseRepository] Failed to calculate trend', { error });
      return [];
    }
  }

  private getLast30DaysDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }

  private getLast7Days(): Date[] {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  }

  public async getRecentPurchases(limit: number = 50): Promise<PurchaseRow[]> {
    try {
      this._logger.info('[SupabasePurchaseRepository] Loading recent purchases', { limit });

      // Получаем транзакции
      const { data: transactions, error: transactionsError } = await this._supabase
        .from('transaction_log')
        .select(`
          id,
          user_id,
          product_id,
          paid_amount,
          created_at,
          payment_status,
          payment_method,
          stripe_payment_intent_id,
          app_id,
          merchant_id
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Получаем данные о продуктах отдельно
      const productIds = transactions?.map(t => t.product_id).filter(Boolean) || [];
      const { data: products } = await this._supabase
        .from('products')
        .select('id, title, rarity')
        .in('id', productIds);

      if (transactionsError) {
        this._logger.error('[SupabasePurchaseRepository] Failed to load recent purchases', {
          error: transactionsError
        });
        throw new Error(`Failed to load recent purchases: ${transactionsError.message}`);
      }

      // Создаем мапу продуктов для быстрого поиска
      const productMap = new Map();
      (products || []).forEach(product => {
        productMap.set(product.id, product);
      });

      // Преобразуем данные в формат PurchaseRow
      const purchases: PurchaseRow[] = (transactions || []).map(transaction => {
        const product = productMap.get(transaction.product_id);
        return {
          id: transaction.id,
          createdAt: transaction.created_at,
          userId: transaction.user_id || '',
          productId: transaction.product_id || '',
          productTitle: product?.title,
          productRarity: product?.rarity,
          paidAmount: parseFloat(transaction.paid_amount || '0'),
          paymentStatus: transaction.payment_status as 'succeeded' | 'pending' | 'failed' | 'refunded',
          paymentMethod: transaction.payment_method,
          stripePaymentIntentId: transaction.stripe_payment_intent_id,
          appId: transaction.app_id,
          merchantId: transaction.merchant_id
        };
      });

      this._logger.info('[SupabasePurchaseRepository] Recent purchases loaded', {
        count: purchases.length
      });

      return purchases;
    } catch (error) {
      this._logger.error('[SupabasePurchaseRepository] Unexpected error loading recent purchases', {
        error
      });
      throw error;
    }
  }
}
