import type { Event } from '../../../../application/ports/event-bus.port';
import type { IEvent } from '../../../../infrastructure/events/event';

type EventIdGenerator = (type: string) => string;

const defaultEventIdGenerator: EventIdGenerator = (type: string) =>
  `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

abstract class BaseUserContextEvent<TPayload> implements Event, IEvent {
  public readonly id: string;
  public readonly timestamp: Date;

  protected constructor(
    public readonly type: string,
    public readonly payload: TPayload,
    public readonly source: string,
    eventIdGenerator: EventIdGenerator = defaultEventIdGenerator
  ) {
    this.timestamp = new Date();
    this.id = eventIdGenerator(type);
  }
}

export interface UserContextEventBasePayload {
  readonly appId: string;
  readonly userId: string;
}

export interface UserRegisteredPayload extends UserContextEventBasePayload {
  readonly registeredAt: string;
}

export class UserRegisteredEvent extends BaseUserContextEvent<UserRegisteredPayload> {
  public static readonly TYPE = 'UserRegisteredEvent';

  public constructor(payload: UserRegisteredPayload, source = 'UserLifecycleService') {
    super(UserRegisteredEvent.TYPE, payload, source);
  }
}

export interface UserReturnedPayload extends UserContextEventBasePayload {
  readonly lastActiveAt: string;
}

export class UserReturnedEvent extends BaseUserContextEvent<UserReturnedPayload> {
  public static readonly TYPE = 'UserReturnedEvent';

  public constructor(payload: UserReturnedPayload, source = 'UserLifecycleService') {
    super(UserReturnedEvent.TYPE, payload, source);
  }
}

export interface FirstPaymentCompletedPayload extends UserContextEventBasePayload {
  readonly paymentId: string;
  readonly amount: number;
  readonly occurredAt: string;
  readonly totalSpend: number;
  readonly purchaseCount: number;
}

export class FirstPaymentCompletedEvent extends BaseUserContextEvent<FirstPaymentCompletedPayload> {
  public static readonly TYPE = 'FirstPaymentCompletedEvent';

  public constructor(payload: FirstPaymentCompletedPayload, source = 'PaymentsService') {
    super(FirstPaymentCompletedEvent.TYPE, payload, source);
  }
}

export interface MbcLinkStatusChangedPayload extends UserContextEventBasePayload {
  readonly isMbcAppUser: boolean;
  readonly linkedAt: string;
}

export class MbcLinkStatusChangedEvent extends BaseUserContextEvent<MbcLinkStatusChangedPayload> {
  public static readonly TYPE = 'MbcLinkStatusChangedEvent';

  public constructor(payload: MbcLinkStatusChangedPayload, source = 'AccountService') {
    super(MbcLinkStatusChangedEvent.TYPE, payload, source);
  }
}

export interface PurchaseRecordedPayload extends UserContextEventBasePayload {
  readonly purchaseId: string;
  readonly amount: number;
  readonly occurredAt: string;
  readonly source?: string | null;
  readonly totalSpend: number;
  readonly purchaseCount: number;
}

export class PurchaseRecordedEvent extends BaseUserContextEvent<PurchaseRecordedPayload> {
  public static readonly TYPE = 'PurchaseRecordedEvent';

  public constructor(payload: PurchaseRecordedPayload, source = 'PurchasesService') {
    super(PurchaseRecordedEvent.TYPE, payload, source);
  }
}

export interface WeeklyPurchaseMetricsPayload extends UserContextEventBasePayload {
  readonly weeklyPurchaseCount: number;
  readonly computedAt: string;
}

export class WeeklyPurchaseMetricsCalculatedEvent extends BaseUserContextEvent<WeeklyPurchaseMetricsPayload> {
  public static readonly TYPE = 'WeeklyPurchaseMetricsCalculatedEvent';

  public constructor(payload: WeeklyPurchaseMetricsPayload, source = 'AnalyticsService') {
    super(WeeklyPurchaseMetricsCalculatedEvent.TYPE, payload, source);
  }
}

export interface LifetimeSpendMilestonePayload extends UserContextEventBasePayload {
  readonly milestoneReached: number;
  readonly reachedAt: string;
}

export class LifetimeSpendMilestoneReachedEvent extends BaseUserContextEvent<LifetimeSpendMilestonePayload> {
  public static readonly TYPE = 'LifetimeSpendMilestoneReachedEvent';

  public constructor(payload: LifetimeSpendMilestonePayload, source = 'AnalyticsService') {
    super(LifetimeSpendMilestoneReachedEvent.TYPE, payload, source);
  }
}

export interface UserActivitySnapshotPayload extends UserContextEventBasePayload {
  readonly daysSinceLastActive: number;
  readonly weeklySessions: number;
  readonly dailyActiveMinutes: number;
  readonly capturedAt: string;
}

export class UserActivitySnapshotEvent extends BaseUserContextEvent<UserActivitySnapshotPayload> {
  public static readonly TYPE = 'UserActivitySnapshotEvent';

  public constructor(payload: UserActivitySnapshotPayload, source = 'AnalyticsService') {
    super(UserActivitySnapshotEvent.TYPE, payload, source);
  }
}

export interface ProductViewRecordedPayload extends UserContextEventBasePayload {
  readonly productId: string;
  readonly recentViewCount: number;
  readonly capturedAt: string;
}

export class ProductViewRecordedEvent extends BaseUserContextEvent<ProductViewRecordedPayload> {
  public static readonly TYPE = 'ProductViewRecordedEvent';

  public constructor(payload: ProductViewRecordedPayload, source = 'BehaviorTrackingService') {
    super(ProductViewRecordedEvent.TYPE, payload, source);
  }
}

export interface CategoryIntentDetectedPayload extends UserContextEventBasePayload {
  readonly categoryId: string;
  readonly intentDetectedAt: string;
  readonly hasIntent: boolean;
}

export class CategoryIntentDetectedEvent extends BaseUserContextEvent<CategoryIntentDetectedPayload> {
  public static readonly TYPE = 'CategoryIntentDetectedEvent';

  public constructor(payload: CategoryIntentDetectedPayload, source = 'BehaviorTrackingService') {
    super(CategoryIntentDetectedEvent.TYPE, payload, source);
  }
}

export type CartStatus = 'active' | 'abandoned' | 'recovered';

export interface CartStatusChangedPayload extends UserContextEventBasePayload {
  readonly status: CartStatus;
  readonly changedAt: string;
}

export class CartStatusChangedEvent extends BaseUserContextEvent<CartStatusChangedPayload> {
  public static readonly TYPE = 'CartStatusChangedEvent';

  public constructor(payload: CartStatusChangedPayload, source = 'CommerceService') {
    super(CartStatusChangedEvent.TYPE, payload, source);
  }
}

export interface WeekendPurchaseWindowUpdatedPayload extends UserContextEventBasePayload {
  readonly isWeekendWindow: boolean;
  readonly updatedAt: string;
}

export class WeekendPurchaseWindowUpdatedEvent extends BaseUserContextEvent<WeekendPurchaseWindowUpdatedPayload> {
  public static readonly TYPE = 'WeekendPurchaseWindowUpdatedEvent';

  public constructor(payload: WeekendPurchaseWindowUpdatedPayload, source = 'PromotionService') {
    super(WeekendPurchaseWindowUpdatedEvent.TYPE, payload, source);
  }
}

export interface UserGeoSegmentResolvedPayload extends UserContextEventBasePayload {
  readonly segment: string;
  readonly resolvedAt: string;
}

export class UserGeoSegmentResolvedEvent extends BaseUserContextEvent<UserGeoSegmentResolvedPayload> {
  public static readonly TYPE = 'UserGeoSegmentResolvedEvent';

  public constructor(payload: UserGeoSegmentResolvedPayload, source = 'GeoService') {
    super(UserGeoSegmentResolvedEvent.TYPE, payload, source);
  }
}

export interface SubscriptionStatusChangedPayload extends UserContextEventBasePayload {
  readonly status: string;
  readonly changedAt: string;
}

export class SubscriptionStatusChangedEvent extends BaseUserContextEvent<SubscriptionStatusChangedPayload> {
  public static readonly TYPE = 'SubscriptionStatusChangedEvent';

  public constructor(payload: SubscriptionStatusChangedPayload, source = 'SubscriptionsService') {
    super(SubscriptionStatusChangedEvent.TYPE, payload, source);
  }
}

export interface SubscriptionPlanChangedPayload extends UserContextEventBasePayload {
  readonly plan: string;
  readonly changedAt: string;
}

export class SubscriptionPlanChangedEvent extends BaseUserContextEvent<SubscriptionPlanChangedPayload> {
  public static readonly TYPE = 'SubscriptionPlanChangedEvent';

  public constructor(payload: SubscriptionPlanChangedPayload, source = 'SubscriptionsService') {
    super(SubscriptionPlanChangedEvent.TYPE, payload, source);
  }
}

export type UserOfferContextDomainEvent =
  | UserRegisteredEvent
  | UserReturnedEvent
  | FirstPaymentCompletedEvent
  | MbcLinkStatusChangedEvent
  | PurchaseRecordedEvent
  | WeeklyPurchaseMetricsCalculatedEvent
  | LifetimeSpendMilestoneReachedEvent
  | UserActivitySnapshotEvent
  | ProductViewRecordedEvent
  | CategoryIntentDetectedEvent
  | CartStatusChangedEvent
  | WeekendPurchaseWindowUpdatedEvent
  | UserGeoSegmentResolvedEvent
  | SubscriptionStatusChangedEvent
  | SubscriptionPlanChangedEvent;











