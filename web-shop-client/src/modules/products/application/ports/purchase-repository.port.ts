
export interface PurchaseRepositoryPort {
  
  getPurchasedProductIds(userId: string, appId: string): Promise<string[]>;

  
  getProductPurchaseCounts(appId: string): Promise<Map<string, number>>;
}
