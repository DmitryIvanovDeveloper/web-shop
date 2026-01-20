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

  public static fromApiResponse(response: any): PaymentMethodsSummary {
    return new PaymentMethodsSummary(
      response.methods || []
    );
  }
}

