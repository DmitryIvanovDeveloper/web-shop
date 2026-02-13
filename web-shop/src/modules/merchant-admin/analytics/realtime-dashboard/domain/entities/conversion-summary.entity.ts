export interface ChannelData {
  name: string;
  value: number;
  percentage: number;
}

export class ConversionSummary {
  constructor(
    public readonly conversionRate: number,
    public readonly channels: ChannelData[],
    public readonly refundRate?: number
  ) {}

  public get isHighConversion(): boolean {
    return this.conversionRate > 0.05; // 5%
  }

  public getTopChannels(limit: number = 3): ChannelData[] {
    return this.channels.slice(0, limit);
  }

  public static fromApiResponse(response: any): ConversionSummary {
    return new ConversionSummary(
      response.kpi.conversionRate,
      response.channels || [],
      response.kpi.refundRate
    );
  }
}
