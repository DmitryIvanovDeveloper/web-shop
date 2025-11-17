import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { ConditionReaderPort } from '../../application/ports/condition-reader.port';
import type { ComparableValue } from '../../domain/types';

const DEFAULT_PROPERTY_VALUES: Record<string, ComparableValue> = {
  'user.flags.isNew': false,
  'user.metrics.daysSinceLastActive': 14,
  'user.metrics.weeklySessions': 3,
  'user.subscription.status': 'active',
  'user.metrics.totalSpend': 0,
  'user.flags.isFirstPayment': false,
  'user.metrics.milestoneSpendReached': 0,
  'user.metrics.weeklyPurchaseCount': 0,
  'behavior.recentProductViews': 0,
  'behavior.cart.status': 'active',
  'behavior.categoryIntent': false,
  'geo.segment': 'standard',
  'user.flags.isMbcAppUser': false,
  'user.subscription.plan': 'monthly',
  'user.lastPurchase.source': 'direct',
  'behavior.isWeekendPurchaseWindow': false,
  'user.metrics.dailyActiveMinutes': 60,
};

@injectable()
export class PropertyReadersService implements ConditionReaderPort {
  private readonly cache: Map<string, ComparableValue> = new Map();

  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async read(propertyPath: string, appId?: string, userId?: string): Promise<ComparableValue> {
    // Create cache key that includes context for user-specific properties
    const cacheKey = userId ? `${propertyPath}:${appId}:${userId}` : propertyPath;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (propertyPath === 'user.purchases.length') {
      // If appId is not provided, return default value (0) without making API call
      // This prevents 400 errors when appId is missing
      if (!appId) {
        const defaultValue = 0;
        this.cache.set(cacheKey, defaultValue);
        return defaultValue;
      }

      // Build query string with appId and userId if provided
      const queryParams = new URLSearchParams();
      queryParams.set('appId', appId);
      if (userId) queryParams.set('userId', userId);
      
      const url = `/api/user/purchases?${queryParams.toString()}`;
      const response = await this.http.get(url);
      const data = response.data;
      const length = Array.isArray(data) ? data.length : ((data as any)?.purchases?.length ?? 0);
      this.cache.set(cacheKey, length);
      return length;
    }

    const fallback = DEFAULT_PROPERTY_VALUES[propertyPath] ?? null;
    this.cache.set(cacheKey, fallback);
    return fallback;
  }
}
