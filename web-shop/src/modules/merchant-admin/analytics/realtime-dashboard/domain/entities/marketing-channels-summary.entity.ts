export interface ChannelSegment {
  id: string;
  name: string;
  color: string;
  value: number;
}

export interface TimeSeriesPoint {
  label: string;
  segments: ChannelSegment[];
}

export class MarketingChannelsSummary {
  constructor(
    public readonly timeSeries: TimeSeriesPoint[]
  ) {}

  public static fromApiResponse(response: any): MarketingChannelsSummary {
    return new MarketingChannelsSummary(
      response.timeSeries || []
    );
  }
}

