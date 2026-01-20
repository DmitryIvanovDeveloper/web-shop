import {
  CartStatusChangedEvent,
  CategoryIntentDetectedEvent,
  FirstPaymentCompletedEvent,
  LifetimeSpendMilestoneReachedEvent,
  MbcLinkStatusChangedEvent,
  ProductViewRecordedEvent,
  PurchaseRecordedEvent,
  SubscriptionPlanChangedEvent,
  SubscriptionStatusChangedEvent,
  UserActivitySnapshotEvent,
  UserGeoSegmentResolvedEvent,
  UserRegisteredEvent,
  UserReturnedEvent,
  WeekendPurchaseWindowUpdatedEvent,
  WeeklyPurchaseMetricsCalculatedEvent,
} from './user-offer-context.events';


export const USER_CONTEXT_EVENT_FIELD_MAP: Record<string, readonly string[]> = {
  [UserRegisteredEvent.TYPE]: ['user.flags.isNew'],
  [UserReturnedEvent.TYPE]: ['user.flags.isNew', 'user.metrics.daysSinceLastActive'],
  [FirstPaymentCompletedEvent.TYPE]: ['user.flags.isFirstPayment', 'user.metrics.totalSpend'],
  [MbcLinkStatusChangedEvent.TYPE]: ['user.flags.isMbcAppUser'],
  [PurchaseRecordedEvent.TYPE]: [
    'user.purchases.length',
    'user.metrics.totalSpend',
    'user.lastPurchase.source',
  ],
  [WeeklyPurchaseMetricsCalculatedEvent.TYPE]: ['user.metrics.weeklyPurchaseCount'],
  [LifetimeSpendMilestoneReachedEvent.TYPE]: ['user.metrics.milestoneSpendReached'],
  [UserActivitySnapshotEvent.TYPE]: [
    'user.metrics.daysSinceLastActive',
    'user.metrics.weeklySessions',
    'user.metrics.dailyActiveMinutes',
  ],
  [ProductViewRecordedEvent.TYPE]: ['behavior.recentProductViews'],
  [CategoryIntentDetectedEvent.TYPE]: ['behavior.categoryIntent'],
  [CartStatusChangedEvent.TYPE]: ['behavior.cart.status'],
  [WeekendPurchaseWindowUpdatedEvent.TYPE]: ['behavior.isWeekendPurchaseWindow'],
  [UserGeoSegmentResolvedEvent.TYPE]: ['geo.segment'],
  [SubscriptionStatusChangedEvent.TYPE]: ['user.subscription.status'],
  [SubscriptionPlanChangedEvent.TYPE]: ['user.subscription.plan'],
};


