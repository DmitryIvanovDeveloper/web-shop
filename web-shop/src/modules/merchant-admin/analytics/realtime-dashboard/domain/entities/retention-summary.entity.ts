export interface RetentionCurve {
  cohortId: string;
  cohortName: string;
  points: { day: number; retention: number }[]; 
}

export class RetentionSummary {
  constructor(
    public readonly curves: RetentionCurve[]
  ) {}

  public static fromApiResponse(response: any): RetentionSummary {
    return new RetentionSummary(
      response.curves || []
    );
  }
}

