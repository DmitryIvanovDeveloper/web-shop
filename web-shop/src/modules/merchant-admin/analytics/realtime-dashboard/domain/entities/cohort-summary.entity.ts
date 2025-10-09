export interface CohortData {
  channel: string;
  users: number;
  revenue: number;
  retention: number; // percentage
}

export class CohortSummary {
  constructor(
    public readonly cohorts: CohortData[]
  ) {}

  public static fromApiResponse(response: any): CohortSummary {
    return new CohortSummary(
      response.cohorts || []
    );
  }
}

