export interface Refund {
  id: string;
  transactionId: string;
  createdAt: string;
  amount: number;
  currency: string;
  reason?: string;
  type: 'refund' | 'chargeback';
}

export class RefundsSummary {
  constructor(
    public readonly refunds: Refund[]
  ) {}

  public static fromApiResponse(response: any): RefundsSummary {
    return new RefundsSummary(
      response.refunds || []
    );
  }
}

