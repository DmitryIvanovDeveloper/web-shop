export interface PaymentMethodItem {
  method: string; // Card, PayPal, Carrier Billing
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

