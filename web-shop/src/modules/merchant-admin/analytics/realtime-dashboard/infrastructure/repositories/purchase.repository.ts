import { injectable } from 'inversify';
import { PurchaseRepositoryPort, PurchaseRow } from '../../application/ports/purchase-repository.port';
import { PurchaseSummary } from '../../domain/entities/purchase-summary.entity';

/**
 * Mock Purchase Repository Implementation
 * 
 * Fallback implementation that returns mock data
 */
@injectable()
export class PurchaseRepository implements PurchaseRepositoryPort {
  public async getPurchaseSummary(): Promise<PurchaseSummary> {
    // Mock data for development
    const mockTrend = [
      { timestamp: new Date('2024-01-01'), value: 45 },
      { timestamp: new Date('2024-01-02'), value: 52 },
      { timestamp: new Date('2024-01-03'), value: 38 },
      { timestamp: new Date('2024-01-04'), value: 61 },
      { timestamp: new Date('2024-01-05'), value: 47 },
      { timestamp: new Date('2024-01-06'), value: 55 },
      { timestamp: new Date('2024-01-07'), value: 49 }
    ];

    return new PurchaseSummary(
      1250, // totalPurchases
      340,  // uniqueCustomers
      89.50, // averagePurchaseValue
      3.7,   // purchaseFrequency
      'Electronics', // topProductCategory
      'USD', // currency
      mockTrend
    );
  }

  public async getRecentPurchases(limit: number = 50): Promise<PurchaseRow[]> {
    // Mock data for development
    const mockPurchases: PurchaseRow[] = [
      {
        id: '1',
        createdAt: new Date().toISOString(),
        userId: 'user-001',
        productId: 'dragon-slayer',
        productTitle: 'Dragon Slayer Sword',
        productRarity: 'LEGENDARY WEAPON',
        paidAmount: 49.99,
        paymentStatus: 'succeeded',
        paymentMethod: 'stripe',
        stripePaymentIntentId: 'pi_1234567890',
        appId: 'APP123',
        merchantId: 'merchant-001'
      },
      {
        id: '2',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        userId: 'user-002',
        productId: 'mythic-chest',
        productTitle: 'Mythic Chest',
        productRarity: 'LEGENDARY CHEST',
        paidAmount: 19.99,
        paymentStatus: 'succeeded',
        paymentMethod: 'stripe',
        stripePaymentIntentId: 'pi_0987654321',
        appId: 'APP123',
        merchantId: 'merchant-001'
      },
      {
        id: '3',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        userId: 'user-003',
        productId: 'hero-fortune',
        productTitle: 'Hero Fortune',
        productRarity: 'EPIC CHARACTER',
        paidAmount: 14.99,
        paymentStatus: 'pending',
        paymentMethod: 'stripe',
        appId: 'APP123',
        merchantId: 'merchant-001'
      }
    ];

    return mockPurchases.slice(0, limit);
  }
}
