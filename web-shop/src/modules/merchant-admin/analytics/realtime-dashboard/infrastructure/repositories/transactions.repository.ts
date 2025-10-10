import { TransactionsRepositoryPort } from '../../application/ports/transactions-repository.port';
import { TransactionsSummary } from '../../domain/entities/transactions-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';
import { FilterApplier } from '../utils/filter-applier';

export class TransactionsRepository implements TransactionsRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getTransactionsSummary(): Promise<TransactionsSummary> {
    // Load current filters
    const filters = await FilterApplier.loadCurrentFilters();
    
    const response = await this.httpClient.get<any>('/api/transactions/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch transactions data: ${response.statusText}`);
    }

    // Apply filters to transactions data
    let data = response.data;
    if (data.transactions && Array.isArray(data.transactions)) {
      let filtered = data.transactions;
      
      // Apply date filter
      filtered = FilterApplier.applyDateFilter(filtered, filters.dateRange);
      
      // Apply geography filter
      filtered = FilterApplier.applyGeographyFilter(filtered, filters.geography);
      
      // Apply payment filter
      filtered = FilterApplier.applyPaymentFilter(filtered, filters.payment);
      
      // Apply currency filter
      filtered = FilterApplier.applyCurrencyFilter(filtered, filters.currency);
      
      // Apply amount filter
      filtered = FilterApplier.applyAmountFilter(filtered, filters.minAmount, filters.maxAmount);
      
      data.transactions = filtered;
      data.totalCount = filtered.length;
    }

    return TransactionsSummary.fromApiResponse(data);
  }
}

