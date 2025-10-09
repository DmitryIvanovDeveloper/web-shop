import { TransactionsRepositoryPort } from '../../application/ports/transactions-repository.port';
import { TransactionsSummary } from '../../domain/entities/transactions-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class TransactionsRepository implements TransactionsRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getTransactionsSummary(): Promise<TransactionsSummary> {
    const response = await this.httpClient.get<any>('/api/transactions/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch transactions data: ${response.statusText}`);
    }

    return TransactionsSummary.fromApiResponse(response.data);
  }
}

