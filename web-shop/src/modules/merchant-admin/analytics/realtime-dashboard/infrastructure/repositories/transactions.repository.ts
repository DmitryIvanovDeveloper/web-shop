import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { TransactionsSummary } from '../../domain/entities/transactions-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface TransactionsRepositoryPort {
  getTransactionsSummary(): Promise<TransactionsSummary>;
}

@injectable()
export class TransactionsRepository implements TransactionsRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getTransactionsSummary(): Promise<TransactionsSummary> {
    const response = await this.httpClient.get('/api/analytics/transactions.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch transactions summary: ${response.statusText}`);
    }

    return TransactionsSummary.fromApiResponse(response.data);
  }
}