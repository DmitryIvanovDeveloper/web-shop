import { RetentionSummary } from '../../domain/entities/retention-summary.entity';

export interface RetentionRepositoryPort {
  getRetentionSummary(): Promise<RetentionSummary>;
}

