import { injectable, inject } from 'inversify';
import type { PurchaseRepositoryPort, PurchaseRow } from '../ports/purchase-repository.port';
import { TYPES } from '../../infrastructure/bootstrap/realtime-dashboard.types';

/**
 * Load Recent Purchases Use Case
 * 
 * Application use case for loading recent purchases data
 * Orchestrates the business logic for purchase analytics
 */
@injectable()
export class LoadRecentPurchasesUseCase {
  constructor(
    @inject(TYPES.PurchaseRepository)
    private readonly purchaseRepository: PurchaseRepositoryPort
  ) {}

  async execute(limit: number = 50): Promise<PurchaseRow[]> {
    return await this.purchaseRepository.getRecentPurchases(limit);
  }
}
