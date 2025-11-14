import { inject, injectable } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import {
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
  UserOfferContextDomainEvent,
  UserRegisteredEvent,
  UserReturnedEvent,
  WeekendPurchaseWindowUpdatedEvent,
  WeeklyPurchaseMetricsCalculatedEvent,
  CartStatusChangedEvent,
} from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
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

const SUPPORTED_EVENT_TYPES = new Set<string>([
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
]);

@injectable()
export class UserOfferContextEventHandler
  implements IAsyncEventHandler<UserOfferContextDomainEvent>
{
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.HandleUserRegisteredUseCase)
    private readonly userRegistered: HandleUserRegisteredUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleUserReturnedUseCase)
    private readonly userReturned: HandleUserReturnedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleFirstPaymentCompletedUseCase)
    private readonly firstPaymentCompleted: HandleFirstPaymentCompletedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleMbcLinkStatusChangedUseCase)
    private readonly mbcLinkStatusChanged: HandleMbcLinkStatusChangedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandlePurchaseRecordedUseCase)
    private readonly purchaseRecorded: HandlePurchaseRecordedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleWeeklyPurchaseMetricsCalculatedUseCase)
    private readonly weeklyPurchaseMetricsCalculated: HandleWeeklyPurchaseMetricsCalculatedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleLifetimeSpendMilestoneReachedUseCase)
    private readonly lifetimeSpendMilestoneReached: HandleLifetimeSpendMilestoneReachedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleUserActivitySnapshotUseCase)
    private readonly userActivitySnapshot: HandleUserActivitySnapshotUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleProductViewRecordedUseCase)
    private readonly productViewRecorded: HandleProductViewRecordedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleCategoryIntentDetectedUseCase)
    private readonly categoryIntentDetected: HandleCategoryIntentDetectedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleCartStatusChangedUseCase)
    private readonly cartStatusChanged: HandleCartStatusChangedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleWeekendPurchaseWindowUpdatedUseCase)
    private readonly weekendPurchaseWindowUpdated: HandleWeekendPurchaseWindowUpdatedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleUserGeoSegmentResolvedUseCase)
    private readonly userGeoSegmentResolved: HandleUserGeoSegmentResolvedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleSubscriptionStatusChangedUseCase)
    private readonly subscriptionStatusChanged: HandleSubscriptionStatusChangedUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleSubscriptionPlanChangedUseCase)
    private readonly subscriptionPlanChanged: HandleSubscriptionPlanChangedUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public canHandle(event: UserOfferContextDomainEvent): boolean {
    return SUPPORTED_EVENT_TYPES.has(event.type);
  }

  public async handleAsync(event: UserOfferContextDomainEvent): Promise<void> {
    try {
      switch (event.type) {
        case UserRegisteredEvent.TYPE:
          await this.userRegistered.execute(event);
          break;
        case UserReturnedEvent.TYPE:
          await this.userReturned.execute(event);
          break;
        case FirstPaymentCompletedEvent.TYPE:
          await this.firstPaymentCompleted.execute(event);
          break;
        case MbcLinkStatusChangedEvent.TYPE:
          await this.mbcLinkStatusChanged.execute(event);
          break;
        case PurchaseRecordedEvent.TYPE:
          await this.purchaseRecorded.execute(event);
          break;
        case WeeklyPurchaseMetricsCalculatedEvent.TYPE:
          await this.weeklyPurchaseMetricsCalculated.execute(event);
          break;
        case LifetimeSpendMilestoneReachedEvent.TYPE:
          await this.lifetimeSpendMilestoneReached.execute(event);
          break;
        case UserActivitySnapshotEvent.TYPE:
          await this.userActivitySnapshot.execute(event);
          break;
        case ProductViewRecordedEvent.TYPE:
          await this.productViewRecorded.execute(event);
          break;
        case CategoryIntentDetectedEvent.TYPE:
          await this.categoryIntentDetected.execute(event);
          break;
        case CartStatusChangedEvent.TYPE:
          await this.cartStatusChanged.execute(event);
          break;
        case WeekendPurchaseWindowUpdatedEvent.TYPE:
          await this.weekendPurchaseWindowUpdated.execute(event);
          break;
        case UserGeoSegmentResolvedEvent.TYPE:
          await this.userGeoSegmentResolved.execute(event);
          break;
        case SubscriptionStatusChangedEvent.TYPE:
          await this.subscriptionStatusChanged.execute(event);
          break;
        case SubscriptionPlanChangedEvent.TYPE:
          await this.subscriptionPlanChanged.execute(event);
          break;
        default:
          this.logger.warn('[UserOfferContextEventHandler] Unsupported event type received', {
            type: event.type,
          });
      }
    } catch (error) {
      this.logger.error('[UserOfferContextEventHandler] Failed to process event', {
        type: event.type,
        error,
      });
      throw error;
    }
  }
}


