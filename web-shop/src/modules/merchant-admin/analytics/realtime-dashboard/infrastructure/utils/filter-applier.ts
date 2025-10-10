/**
 * Utility to apply filters to data
 */

interface DateRange {
  start: string;
  end: string;
}

interface Filters {
  dateRange?: DateRange;
  geography?: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
  };
  payment?: {
    methods?: string[];
    providers?: string[];
  };
  acquisition?: {
    sources?: string[];
    campaigns?: string[];
    channels?: string[];
  };
  currency?: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
}

export class FilterApplier {
  /**
   * Apply date range filter to data
   */
  static applyDateFilter<T extends { timestamp?: Date | string; date?: Date | string }>(
    data: T[],
    dateRange?: DateRange
  ): T[] {
    if (!dateRange) return data;

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    return data.filter((item) => {
      const itemDate = new Date(item.timestamp || item.date || Date.now());
      return itemDate >= start && itemDate <= end;
    });
  }

  /**
   * Apply geography filter to data
   */
  static applyGeographyFilter<T extends { country?: string; region?: string; city?: string }>(
    data: T[],
    geography?: Filters['geography']
  ): T[] {
    if (!geography) return data;

    return data.filter((item) => {
      if (geography.countries && geography.countries.length > 0) {
        if (!item.country || !geography.countries.includes(item.country)) {
          return false;
        }
      }
      if (geography.regions && geography.regions.length > 0) {
        if (!item.region || !geography.regions.includes(item.region)) {
          return false;
        }
      }
      if (geography.cities && geography.cities.length > 0) {
        if (!item.city || !geography.cities.includes(item.city)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Apply payment filter to data
   */
  static applyPaymentFilter<T extends { paymentMethod?: string; provider?: string }>(
    data: T[],
    payment?: Filters['payment']
  ): T[] {
    if (!payment) return data;

    return data.filter((item) => {
      if (payment.methods && payment.methods.length > 0) {
        if (!item.paymentMethod || !payment.methods.includes(item.paymentMethod)) {
          return false;
        }
      }
      if (payment.providers && payment.providers.length > 0) {
        if (!item.provider || !payment.providers.includes(item.provider)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Apply acquisition filter to data
   */
  static applyAcquisitionFilter<T extends { source?: string; campaign?: string; channel?: string }>(
    data: T[],
    acquisition?: Filters['acquisition']
  ): T[] {
    if (!acquisition) return data;

    return data.filter((item) => {
      if (acquisition.sources && acquisition.sources.length > 0) {
        if (!item.source || !acquisition.sources.includes(item.source)) {
          return false;
        }
      }
      if (acquisition.campaigns && acquisition.campaigns.length > 0) {
        if (!item.campaign || !acquisition.campaigns.includes(item.campaign)) {
          return false;
        }
      }
      if (acquisition.channels && acquisition.channels.length > 0) {
        if (!item.channel || !acquisition.channels.includes(item.channel)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Apply currency filter to data
   */
  static applyCurrencyFilter<T extends { currency?: string }>(
    data: T[],
    currencies?: string[]
  ): T[] {
    if (!currencies || currencies.length === 0) return data;

    return data.filter((item) => {
      return item.currency && currencies.includes(item.currency);
    });
  }

  /**
   * Apply amount range filter to data
   */
  static applyAmountFilter<T extends { amount?: number; value?: number }>(
    data: T[],
    minAmount?: number | null,
    maxAmount?: number | null
  ): T[] {
    return data.filter((item) => {
      const amount = item.amount || item.value || 0;
      if (minAmount !== null && minAmount !== undefined && amount < minAmount) {
        return false;
      }
      if (maxAmount !== null && maxAmount !== undefined && amount > maxAmount) {
        return false;
      }
      return true;
    });
  }

  /**
   * Apply all filters to data
   */
  static applyAllFilters<T>(data: T[], filters: Filters): T[] {
    let filtered = data;

    // Apply date filter
    filtered = this.applyDateFilter(filtered as any, filters.dateRange) as T[];

    // Apply geography filter
    filtered = this.applyGeographyFilter(filtered as any, filters.geography) as T[];

    // Apply payment filter
    filtered = this.applyPaymentFilter(filtered as any, filters.payment) as T[];

    // Apply acquisition filter
    filtered = this.applyAcquisitionFilter(filtered as any, filters.acquisition) as T[];

    // Apply currency filter
    filtered = this.applyCurrencyFilter(filtered as any, filters.currency) as T[];

    // Apply amount filter
    filtered = this.applyAmountFilter(filtered as any, filters.minAmount, filters.maxAmount) as T[];

    return filtered;
  }

  /**
   * Load current filters from mock JSON
   */
  static async loadCurrentFilters(): Promise<Filters> {
    try {
      const response = await fetch('/mocks/api/filters/current.json');
      return await response.json();
    } catch (error) {
      console.error('Failed to load filters:', error);
      return {};
    }
  }

  /**
   * Save current filters to mock JSON (simulated - in real app would call API)
   */
  static async saveCurrentFilters(filters: Filters): Promise<void> {
    console.log('Filters saved (simulated):', filters);
    // In real app, this would make a POST request to save filters
    // For now, we just log them
  }
}

