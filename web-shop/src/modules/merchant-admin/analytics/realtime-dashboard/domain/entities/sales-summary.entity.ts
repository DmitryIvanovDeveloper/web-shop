export interface TrendDataPoint {
  timestamp: Date;
  value: number;
}

export class SalesSummary {
  constructor(
    public readonly totalSales: number,
    public readonly transactions: number,
    public readonly arpu: number,
    public readonly currency: string,
    public readonly trend: TrendDataPoint[]
  ) {}

  public static fromApiResponse(response: any): SalesSummary {
    return new SalesSummary(
      response.kpi.totalSales,
      response.kpi.transactions,
      response.kpi.arpu,
      response.kpi.currency,
      response.trend.map((point: any) => ({
        timestamp: new Date(point.timestamp),
        value: point.value
      }))
    );
  }
}
