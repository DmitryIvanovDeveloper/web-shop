import { RefundsSummary } from '../../domain/entities/refunds-summary.entity';

export interface RefundsRepositoryPort {
  getRefundsSummary(): Promise<RefundsSummary>;
}

