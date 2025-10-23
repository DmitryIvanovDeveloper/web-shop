/**
 * Purchase Repository Port
 * 
 * Interface for purchase data operations
 * Abstracts purchase history access from business logic
 */
export interface PurchaseRepositoryPort {
  /**
   * Get purchased product IDs for a specific user and app
   */
  getPurchasedProductIds(userId: string, appId: string): Promise<string[]>;
}
