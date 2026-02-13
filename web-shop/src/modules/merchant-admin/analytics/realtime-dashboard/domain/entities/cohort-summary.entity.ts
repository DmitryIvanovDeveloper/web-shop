export interface CohortData {
  channel: string;
  users: number;
  revenue: number;
  retention: number; 
}

export class CohortSummary {
  constructor(
    public readonly cohorts: CohortData[]
  ) {}

  public get totalUsers(): number {
    return this.cohorts.reduce((sum, cohort) => sum + cohort.users, 0);
  }

  public get totalRevenue(): number {
    return this.cohorts.reduce((sum, cohort) => sum + cohort.revenue, 0);
  }

  public getByChannel(channel: string): CohortData[] {
    return this.cohorts.filter(c => c.channel === channel);
  }

  public static fromApiResponse(response: any): CohortSummary {
    return new CohortSummary(
      response.cohorts || []
    );
  }
}

