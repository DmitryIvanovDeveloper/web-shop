import { Container } from 'inversify';
import { UserOfferContextSupabaseRepository } from '../repositories/user-offer-context.supabase-repository';
import { HandleUserRegisteredUseCase } from '../../application/use-cases/handle-user-registered.use-case';
import { HandleUserReturnedUseCase } from '../../application/use-cases/handle-user-returned.use-case';
import { HandleFirstPaymentCompletedUseCase } from '../../application/use-cases/handle-first-payment-completed.use-case';
import { HandleMbcLinkStatusChangedUseCase } from '../../application/use-cases/handle-mbc-link-status-changed.use-case';
import { HandlePurchaseRecordedUseCase } from '../../application/use-cases/handle-purchase-recorded.use-case';
import { HandleWeeklyPurchaseMetricsCalculatedUseCase } from '../../application/use-cases/handle-weekly-purchase-metrics-calculated.use-case';
import { HandleLifetimeSpendMilestoneReachedUseCase } from '../../application/use-cases/handle-lifetime-spend-milestone-reached.use-case';
import { HandleUserActivitySnapshotUseCase } from '../../application/use-cases/handle-user-activity-snapshot.use-case';
import { HandleProductViewRecordedUseCase } from '../../application/use-cases/handle-product-view-recorded.use-case';
import { HandleCategoryIntentDetectedUseCase } from '../../application/use-cases/handle-category-intent-detected.use-case';
import { HandleCartStatusChangedUseCase } from '../../application/use-cases/handle-cart-status-changed.use-case';
import { HandleWeekendPurchaseWindowUpdatedUseCase } from '../../application/use-cases/handle-weekend-purchase-window-updated.use-case';
import { HandleUserGeoSegmentResolvedUseCase } from '../../application/use-cases/handle-user-geo-segment-resolved.use-case';
import { HandleSubscriptionStatusChangedUseCase } from '../../application/use-cases/handle-subscription-status-changed.use-case';
import { HandleSubscriptionPlanChangedUseCase } from '../../application/use-cases/handle-subscription-plan-changed.use-case';
import { UserOfferContextEventHandler } from '../../interface-adapters/handlers/user-offer-context-event.handler';
import { UserAuthenticatedEventHandler } from '../../interface-adapters/handlers/user-authenticated-event.handler';
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
} from '../../domain/events/user-offer-context.events';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import type { UserOfferContextDomainEvent } from '../../domain/events/user-offer-context.events';
import { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import { USER_OFFER_CONTEXT_TYPES } from './types';

export function bindUserOfferContext(container: Container): void {
    container.bind(UserOfferContextSupabaseRepository).toSelf().inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.ContextReader)
    .toService(UserOfferContextSupabaseRepository);
  container
    .bind(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    .toService(UserOfferContextSupabaseRepository);

    container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleUserRegisteredUseCase)
    .to(HandleUserRegisteredUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleUserReturnedUseCase)
    .to(HandleUserReturnedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleFirstPaymentCompletedUseCase)
    .to(HandleFirstPaymentCompletedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleMbcLinkStatusChangedUseCase)
    .to(HandleMbcLinkStatusChangedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandlePurchaseRecordedUseCase)
    .to(HandlePurchaseRecordedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleWeeklyPurchaseMetricsCalculatedUseCase)
    .to(HandleWeeklyPurchaseMetricsCalculatedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleLifetimeSpendMilestoneReachedUseCase)
    .to(HandleLifetimeSpendMilestoneReachedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleUserActivitySnapshotUseCase)
    .to(HandleUserActivitySnapshotUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleProductViewRecordedUseCase)
    .to(HandleProductViewRecordedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleCategoryIntentDetectedUseCase)
    .to(HandleCategoryIntentDetectedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleCartStatusChangedUseCase)
    .to(HandleCartStatusChangedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleWeekendPurchaseWindowUpdatedUseCase)
    .to(HandleWeekendPurchaseWindowUpdatedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleUserGeoSegmentResolvedUseCase)
    .to(HandleUserGeoSegmentResolvedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleSubscriptionStatusChangedUseCase)
    .to(HandleSubscriptionStatusChangedUseCase)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.HandleSubscriptionPlanChangedUseCase)
    .to(HandleSubscriptionPlanChangedUseCase)
    .inSingletonScope();

    container
    .bind(USER_OFFER_CONTEXT_TYPES.UserOfferContextEventHandler)
    .to(UserOfferContextEventHandler)
    .inSingletonScope();
  container
    .bind(USER_OFFER_CONTEXT_TYPES.UserOfferContextAuthenticatedHandler)
    .to(UserAuthenticatedEventHandler)
    .inSingletonScope();

  const eventTypes = [
    UserRegisteredEvent.TYPE,
    UserReturnedEvent.TYPE,
    FirstPaymentCompletedEvent.TYPE,
    MbcLinkStatusChangedEvent.TYPE,
    PurchaseRecordedEvent.TYPE,
    WeeklyPurchaseMetricsCalculatedEvent.TYPE,
    LifetimeSpendMilestoneReachedEvent.TYPE,
    UserActivitySnapshotEvent.TYPE,
    ProductViewRecordedEvent.TYPE,
    CategoryIntentDetectedEvent.TYPE,
    CartStatusChangedEvent.TYPE,
    WeekendPurchaseWindowUpdatedEvent.TYPE,
    UserGeoSegmentResolvedEvent.TYPE,
    SubscriptionStatusChangedEvent.TYPE,
    SubscriptionPlanChangedEvent.TYPE,
  ];

  for (const eventType of eventTypes) {
    container
      .bind<IAsyncEventHandler<UserOfferContextDomainEvent>>(Symbol.for(`IAsyncEventHandler<${eventType}>`))
      .toService(USER_OFFER_CONTEXT_TYPES.UserOfferContextEventHandler);
  }

  container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(USER_OFFER_CONTEXT_TYPES.UserAuthenticatedEventHandler)
    .toService(USER_OFFER_CONTEXT_TYPES.UserOfferContextAuthenticatedHandler);
}











