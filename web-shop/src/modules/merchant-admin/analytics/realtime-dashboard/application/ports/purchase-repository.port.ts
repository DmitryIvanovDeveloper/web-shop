import { PurchaseSummary } from '../../domain/entities/purchase-summary.entity';

export interface PurchaseRow {
  id: string;
  createdAt: string;
  userId: string;
  productId: string;
  productTitle?: string;
  productRarity?: string;
  paidAmount: number;
  paymentStatus: 'succeeded' | 'pending' | 'failed' | 'refunded';
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  appId?: string;
  merchantId?: string;
}

/**
 * Purchase Repository Port
 * 
 * Interface for purchase analytics operations
 * Abstracts purchase data access from business logic
 */
export interface PurchaseRepositoryPort {
  /**
   * Get purchase summary with analytics data
   */
  getPurchaseSummary(): Promise<PurchaseSummary>;

  /**
   * Get recent purchases for analytics table
   */
  getRecentPurchases(limit?: number): Promise<PurchaseRow[]>;
}
