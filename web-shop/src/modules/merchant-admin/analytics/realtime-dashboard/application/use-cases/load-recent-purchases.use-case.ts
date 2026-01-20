import { injectable, inject } from 'inversify';
import type { PurchaseRepositoryPort, PurchaseRow } from '../ports/purchase-repository.port';
import { TYPES } from '../../infrastructure/bootstrap/realtime-dashboard.types';

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
