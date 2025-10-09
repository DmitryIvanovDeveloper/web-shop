import { CohortSummary } from '../../domain/entities/cohort-summary.entity';

export interface CohortRepositoryPort {
  getCohortSummary(): Promise<CohortSummary>;
}

