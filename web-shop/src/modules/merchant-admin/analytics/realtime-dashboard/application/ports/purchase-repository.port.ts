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

export interface PurchaseRepositoryPort {
  
  getPurchaseSummary(): Promise<PurchaseSummary>;

  getRecentPurchases(limit?: number): Promise<PurchaseRow[]>;
}
