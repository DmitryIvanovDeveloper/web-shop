import { injectable, inject } from 'inversify';
import { TransactionsRepositoryPort } from '../../application/ports/transactions-repository.port';
import { TransactionsSummary } from '../../domain/entities/transactions-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
export class TransactionsRepository implements TransactionsRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getTransactionsSummary(): Promise<TransactionsSummary> {
    try {
      const response = await this.httpClient.get<any>('/api/transactions/summary');
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch transactions data: ${response.statusText}`);
      }

      // Возвращаем данные без фильтрации (фильтрация будет добавлена позже)
      return TransactionsSummary.fromApiResponse(response.data);
    } catch (error) {
      console.error('Error loading transactions data:', error);
      throw error;
    }
  }
}

