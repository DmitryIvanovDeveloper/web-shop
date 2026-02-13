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

  public get totalSegments(): number {
    return this.timeSeries.reduce((sum, point) => sum + point.segments.length, 0);
  }

  public getSegmentById(id: string): ChannelSegment | undefined {
    for (const point of this.timeSeries) {
      const segment = point.segments.find(s => s.id === id);
      if (segment) return segment;
    }
    return undefined;
  }

  public getLatestPoint(): TimeSeriesPoint | undefined {
    return this.timeSeries[this.timeSeries.length - 1];
  }

  public static fromApiResponse(response: any): MarketingChannelsSummary {
    return new MarketingChannelsSummary(
      response.timeSeries || []
    );
  }
}

