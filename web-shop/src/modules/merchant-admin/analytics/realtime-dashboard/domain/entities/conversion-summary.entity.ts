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

  public static fromApiResponse(response: any): ConversionSummary {
    return new ConversionSummary(
      response.kpi.conversionRate, 
      response.channels,
      response.kpi.refundRate
    );
  }
}
