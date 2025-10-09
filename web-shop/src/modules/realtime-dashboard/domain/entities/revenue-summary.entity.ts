export interface TrendDataPoint {
  timestamp: Date;
  value: number;
}

export class RevenueSummary {
  constructor(
    public readonly totalRevenue: number,
    public readonly averageOrderValue: number,
    public readonly revenuePerVisitor: number,
    public readonly netIncome: number,
    public readonly monthlyGrowth: number,
    public readonly currency: string,
    public readonly trend: TrendDataPoint[]
  ) {}

  public static fromApiResponse(response: any): RevenueSummary {
    return new RevenueSummary(
      response.kpi.totalRevenue,
      response.kpi.averageOrderValue,
      response.kpi.revenuePerVisitor,
      response.kpi.netIncome,
      response.kpi.monthlyGrowth,
      response.kpi.currency,
      response.trend.map((point: any) => ({
        timestamp: new Date(point.timestamp),
        value: point.value
      }))
    );
  }
}
