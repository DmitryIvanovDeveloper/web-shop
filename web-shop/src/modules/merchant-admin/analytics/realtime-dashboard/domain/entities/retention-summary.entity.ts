export interface RetentionCurve {
  cohortId: string;
  cohortName: string;
  points: { day: number; retention: number }[]; 
}

export class RetentionSummary {
  constructor(
    public readonly curves: RetentionCurve[]
  ) {}

  public getAverageRetention(day: number): number {
    if (this.curves.length === 0) return 0;
    const total = this.curves.reduce((sum, curve) => {
      const point = curve.points.find(p => p.day === day);
      return sum + (point?.retention || 0);
    }, 0);
    return total / this.curves.length;
  }

  public getCurveById(cohortId: string): RetentionCurve | undefined {
    return this.curves.find(c => c.cohortId === cohortId);
  }

  public static fromApiResponse(response: any): RetentionSummary {
    return new RetentionSummary(
      response.curves || []
    );
  }
}

