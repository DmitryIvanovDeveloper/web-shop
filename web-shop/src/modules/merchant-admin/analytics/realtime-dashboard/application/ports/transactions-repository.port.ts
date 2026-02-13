import { TransactionsSummary } from '../../domain/entities/transactions-summary.entity';

export interface TransactionsRepositoryPort {
  getTransactionsSummary(): Promise<TransactionsSummary>;
}