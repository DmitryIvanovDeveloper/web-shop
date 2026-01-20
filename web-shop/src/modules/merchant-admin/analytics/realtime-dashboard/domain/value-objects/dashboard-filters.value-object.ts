import { Period } from './period.value-object';

export type PlatformType = 'iOS' | 'Android' | 'Web' | 'All';

export class DashboardFilters {
  public readonly period: Period;
  public readonly regions: readonly string[];
  public readonly platform: PlatformType;
  public readonly currency: string;

  private constructor(
    period: Period,
    regions: string[],
    platform: PlatformType,
    currency: string
  ) {
    this.period = period;
    this.regions = [...regions];
    this.platform = platform;
    this.currency = currency;
  }

  public static create(
    period: Period,
    regions: string[] = [],
    platform: PlatformType = 'All',
    currency: string = 'USD'
  ): DashboardFilters {
    
    if (currency.length !== 3) {
      throw new Error('Currency must be 3 characters (e.g., USD, EUR)');
    }

    if (regions.length > 0) {
      for (const region of regions) {
        if (!region || region.trim().length === 0) {
          throw new Error('Region codes cannot be empty');
        }
      }
    }

    return new DashboardFilters(period, regions, platform, currency.toUpperCase());
  }

  public withPeriod(newPeriod: Period): DashboardFilters {
    return new DashboardFilters(newPeriod, [...this.regions], this.platform, this.currency);
  }

  public withRegions(newRegions: string[]): DashboardFilters {
    return new DashboardFilters(this.period, newRegions, this.platform, this.currency);
  }

  public withPlatform(newPlatform: PlatformType): DashboardFilters {
    return new DashboardFilters(this.period, [...this.regions], newPlatform, this.currency);
  }

  public withCurrency(newCurrency: string): DashboardFilters {
    return new DashboardFilters(this.period, [...this.regions], this.platform, newCurrency);
  }

  public hasRegion(region: string): boolean {
    return this.regions.length === 0 || this.regions.includes(region);
  }

  public isPlatform(platform: PlatformType): boolean {
    return this.platform === 'All' || this.platform === platform;
  }

  public isEmpty(): boolean {
    return this.regions.length === 0 && this.platform === 'All';
  }

  public toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {
      period: this.period.toString(),
      currency: this.currency
    };

    if (this.regions.length > 0) {
      params.regions = this.regions.join(',');
    }

    if (this.platform !== 'All') {
      params.platform = this.platform;
    }

    return params;
  }

  public toJSON(): Record<string, any> {
    return {
      period: this.period,
      regions: this.regions,
      platform: this.platform,
      currency: this.currency
    };
  }
}

