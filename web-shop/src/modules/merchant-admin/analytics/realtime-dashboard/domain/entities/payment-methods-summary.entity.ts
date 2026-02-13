export interface PaymentMethodItem {
  method: string; 
  revenue: number;
  transactions: number;
  percentage: number;
}

export class PaymentMethodsSummary {
  constructor(
    public readonly methods: PaymentMethodItem[]
  ) {}

  public get totalRevenue(): number {
    return this.methods.reduce((sum, method) => sum + method.revenue, 0);
  }

  public get totalTransactions(): number {
    return this.methods.reduce((sum, method) => sum + method.transactions, 0);
  }

  public getTopMethods(limit: number = 3): PaymentMethodItem[] {
    return this.methods
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  public static fromApiResponse(response: any): PaymentMethodsSummary {
    return new PaymentMethodsSummary(
      response.methods || []
    );
  }
}

