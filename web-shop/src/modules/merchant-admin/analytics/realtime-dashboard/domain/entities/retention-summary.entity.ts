export interface RetentionCurve {
  cohortId: string;
  cohortName: string;
  points: { day: number; retention: number }[]; // retention as percentage 0-100
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

