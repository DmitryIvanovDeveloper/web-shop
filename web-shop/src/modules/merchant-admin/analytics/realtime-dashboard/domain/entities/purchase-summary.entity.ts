import { TrendDataPoint } from '../types/trend.types';

export class PurchaseSummary {
  constructor(
    public readonly totalPurchases: number,
    public readonly uniqueCustomers: number,
    public readonly averagePurchaseValue: number,
    public readonly purchaseFrequency: number,
    public readonly topProductCategory: string,
    public readonly currency: string,
    public readonly trend: TrendDataPoint[]
  ) {}

  public static fromApiResponse(response: any): PurchaseSummary {
    return new PurchaseSummary(
      response.kpi.totalPurchases,
      response.kpi.uniqueCustomers,
      response.kpi.averagePurchaseValue,
      response.kpi.purchaseFrequency,
      response.kpi.topProductCategory,
      response.kpi.currency,
      response.trend.map((point: any) => ({
        timestamp: new Date(point.timestamp),
        value: point.value
      }))
    );
  }

  public getConversionRate(): number {
    if (this.uniqueCustomers === 0) return 0;
    return (this.totalPurchases / this.uniqueCustomers) * 100;
  }

  public getCustomerLifetimeValue(): number {
    if (this.uniqueCustomers === 0) return 0;
    return (this.totalPurchases * this.averagePurchaseValue) / this.uniqueCustomers;
  }

  public getPurchaseGrowthRate(): number {
    if (this.trend.length < 2) return 0;
    
    const latest = this.trend[this.trend.length - 1].value;
    const previous = this.trend[this.trend.length - 2].value;
    
    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
  }
}
