export interface Transaction {
  id: string;
  createdAt: string;
  user: string;
  amount: number;
  currency: string;
  country?: string;
  method?: string;
  status: 'success' | 'refunded' | 'chargeback' | 'failed';
}

export class TransactionsSummary {
  constructor(
    public readonly transactions: Transaction[]
  ) {}

  public get totalTransactions(): number {
    return this.transactions.length;
  }

  public get successfulTransactions(): Transaction[] {
    return this.transactions.filter(t => t.status === 'success');
  }

  public get failedTransactions(): Transaction[] {
    return this.transactions.filter(t => t.status === 'failed');
  }

  public static fromApiResponse(response: any): TransactionsSummary {
    return new TransactionsSummary(
      response.transactions || []
    );
  }
}

