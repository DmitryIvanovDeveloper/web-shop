export class DashboardSettings {
  constructor(
    public readonly dateRange: string,
    public readonly refreshInterval: number,
    public readonly theme: string
  ) {}

  public static createDefault(): DashboardSettings {
    return new DashboardSettings('last7days', 30000, 'light');
  }

  public static fromQueryParams(params: URLSearchParams): { success: boolean; data: DashboardSettings } {
    const dateRange = params.get('dateRange') || 'last7days';
    const refreshInterval = parseInt(params.get('refreshInterval') || '30000');
    const theme = params.get('theme') || 'light';

    return {
      success: true,
      data: new DashboardSettings(dateRange, refreshInterval, theme)
    };
  }

  public toQueryParams(): URLSearchParams {
    const params = new URLSearchParams();
    params.set('dateRange', this.dateRange);
    params.set('refreshInterval', this.refreshInterval.toString());
    params.set('theme', this.theme);
    return params;
  }
}
