export interface RegionData {
  country: string;
  percentage: number;
}

export class GeographySummary {
  constructor(public readonly regions: RegionData[]) {}

  public get totalRegions(): number {
    return this.regions.length;
  }

  public getTopRegions(limit: number = 5): RegionData[] {
    return this.regions.slice(0, limit);
  }

  public static fromApiResponse(response: any): GeographySummary {
    return new GeographySummary(response.regions || []);
  }
}

