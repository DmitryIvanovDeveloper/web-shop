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

  public get totalRefunded(): number {
    return this.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  }

  public get refundsByType(): Record<string, Refund[]> {
    return this.refunds.reduce((acc, refund) => {
      if (!acc[refund.type]) {
        acc[refund.type] = [];
      }
      acc[refund.type].push(refund);
      return acc;
    }, {} as Record<string, Refund[]>);
  }

  public get refundsByReason(): Record<string, Refund[]> {
    return this.refunds.reduce((acc, refund) => {
      const reason = refund.reason || 'unknown';
      if (!acc[reason]) {
        acc[reason] = [];
      }
      acc[reason].push(refund);
      return acc;
    }, {} as Record<string, Refund[]>);
  }

  public static fromApiResponse(response: any): RefundsSummary {
    return new RefundsSummary(
      response.refunds || []
    );
  }
}

