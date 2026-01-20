export interface RegionData {
  country: string;
  percentage: number;
}

export class GeographySummary {
  constructor(public readonly regions: RegionData[]) {}

  public static fromApiResponse(response: any): GeographySummary {
    return new GeographySummary(response.regions);
  }
}

