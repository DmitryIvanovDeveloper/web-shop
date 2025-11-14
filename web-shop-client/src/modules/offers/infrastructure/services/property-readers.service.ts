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

  public async read(propertyPath: string): Promise<ComparableValue> {
    if (this.cache.has(propertyPath)) {
      return this.cache.get(propertyPath)!;
    }

    if (propertyPath === 'user.purchases.length') {
      const response = await this.http.get('/api/user/purchases');
      const data = response.data;
      const length = Array.isArray(data) ? data.length : ((data as any)?.purchases?.length ?? 0);
      this.cache.set(propertyPath, length);
      return length;
    }

    const fallback = DEFAULT_PROPERTY_VALUES[propertyPath] ?? null;
    this.cache.set(propertyPath, fallback);
    return fallback;
  }
}
