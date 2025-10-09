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

  public static fromApiResponse(response: any): TransactionsSummary {
    return new TransactionsSummary(
      response.transactions || []
    );
  }
}

