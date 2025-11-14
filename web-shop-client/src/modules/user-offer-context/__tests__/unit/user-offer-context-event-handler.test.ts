import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserOfferContextEventHandler } from '../../interface-adapters/handlers/user-offer-context-event.handler';
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
  UserRegisteredEvent,
  UserReturnedEvent,
  WeekendPurchaseWindowUpdatedEvent,
  WeeklyPurchaseMetricsCalculatedEvent,
  CartStatusChangedEvent,
} from '../../domain/events/user-offer-context.events';

const mockLogger = (): Logger => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
});

const createMockUseCase = () => ({
  execute: vi.fn(),
});

describe('UserOfferContextEventHandler', () => {
  const appId = 'APP123';
  const userId = 'user-1';

  let handler: UserOfferContextEventHandler;
  const useCases = {
    registered: createMockUseCase(),
    returned: createMockUseCase(),
    firstPayment: createMockUseCase(),
    mbcLink: createMockUseCase(),
    purchaseRecorded: createMockUseCase(),
    weeklyMetrics: createMockUseCase(),
    milestoneReached: createMockUseCase(),
    activitySnapshot: createMockUseCase(),
    productView: createMockUseCase(),
    categoryIntent: createMockUseCase(),
    cartStatus: createMockUseCase(),
    weekendWindow: createMockUseCase(),
    geoSegment: createMockUseCase(),
    subscriptionStatus: createMockUseCase(),
    subscriptionPlan: createMockUseCase(),
  };

  beforeEach(() => {
    for (const uc of Object.values(useCases)) {
      uc.execute.mockReset();
    }
    handler = new UserOfferContextEventHandler(
      useCases.registered as any,
      useCases.returned as any,
      useCases.firstPayment as any,
      useCases.mbcLink as any,
      useCases.purchaseRecorded as any,
      useCases.weeklyMetrics as any,
      useCases.milestoneReached as any,
      useCases.activitySnapshot as any,
      useCases.productView as any,
      useCases.categoryIntent as any,
      useCases.cartStatus as any,
      useCases.weekendWindow as any,
      useCases.geoSegment as any,
      useCases.subscriptionStatus as any,
      useCases.subscriptionPlan as any,
      mockLogger()
    );
  });

  it('canHandle returns true for supported events', () => {
    const event = new UserRegisteredEvent({ appId, userId, registeredAt: new Date().toISOString() });
    expect(handler.canHandle(event)).toBe(true);
  });

  it('routes events to corresponding use cases', async () => {
    const cases: Array<[any, keyof typeof useCases]> = [
      [new UserRegisteredEvent({ appId, userId, registeredAt: new Date().toISOString() }), 'registered'],
      [new UserReturnedEvent({ appId, userId, lastActiveAt: new Date().toISOString() }), 'returned'],
      [
        new FirstPaymentCompletedEvent({
          appId,
          userId,
          paymentId: 'payment-1',
          amount: 5,
          occurredAt: new Date().toISOString(),
          totalSpend: 5,
          purchaseCount: 1,
        }),
        'firstPayment',
      ],
      [
        new MbcLinkStatusChangedEvent({
          appId,
          userId,
          isMbcAppUser: true,
          linkedAt: new Date().toISOString(),
        }),
        'mbcLink',
      ],
      [
        new PurchaseRecordedEvent({
          appId,
          userId,
          purchaseId: 'purchase-1',
          amount: 3,
          occurredAt: new Date().toISOString(),
          source: 'direct',
          totalSpend: 10,
          purchaseCount: 2,
        }),
        'purchaseRecorded',
      ],
      [
        new WeeklyPurchaseMetricsCalculatedEvent({
          appId,
          userId,
          weeklyPurchaseCount: 4,
          computedAt: new Date().toISOString(),
        }),
        'weeklyMetrics',
      ],
      [
        new LifetimeSpendMilestoneReachedEvent({
          appId,
          userId,
          milestoneReached: 100,
          reachedAt: new Date().toISOString(),
        }),
        'milestoneReached',
      ],
      [
        new UserActivitySnapshotEvent({
          appId,
          userId,
          daysSinceLastActive: 1,
          weeklySessions: 2,
          dailyActiveMinutes: 90,
          capturedAt: new Date().toISOString(),
        }),
        'activitySnapshot',
      ],
      [
        new ProductViewRecordedEvent({
          appId,
          userId,
          productId: 'product-1',
          recentViewCount: 2,
          capturedAt: new Date().toISOString(),
        }),
        'productView',
      ],
      [
        new CategoryIntentDetectedEvent({
          appId,
          userId,
          categoryId: 'weapons',
          hasIntent: true,
          intentDetectedAt: new Date().toISOString(),
        }),
        'categoryIntent',
      ],
      [
        new CartStatusChangedEvent({
          appId,
          userId,
          status: 'abandoned',
          changedAt: new Date().toISOString(),
        }),
        'cartStatus',
      ],
      [
        new WeekendPurchaseWindowUpdatedEvent({
          appId,
          userId,
          isWeekendWindow: true,
          updatedAt: new Date().toISOString(),
        }),
        'weekendWindow',
      ],
      [
        new UserGeoSegmentResolvedEvent({
          appId,
          userId,
          segment: 'high_income',
          resolvedAt: new Date().toISOString(),
        }),
        'geoSegment',
      ],
      [
        new SubscriptionStatusChangedEvent({
          appId,
          userId,
          status: 'active',
          changedAt: new Date().toISOString(),
        }),
        'subscriptionStatus',
      ],
      [
        new SubscriptionPlanChangedEvent({
          appId,
          userId,
          plan: 'monthly',
          changedAt: new Date().toISOString(),
        }),
        'subscriptionPlan',
      ],
    ];

    for (const [event, key] of cases) {
      await handler.handleAsync(event);
      expect(useCases[key].execute).toHaveBeenCalledWith(event);
    }
  });

  it('logs warning for unsupported event types', async () => {
    const logger = mockLogger();
    const localHandler = new UserOfferContextEventHandler(
      useCases.registered as any,
      useCases.returned as any,
      useCases.firstPayment as any,
      useCases.mbcLink as any,
      useCases.purchaseRecorded as any,
      useCases.weeklyMetrics as any,
      useCases.milestoneReached as any,
      useCases.activitySnapshot as any,
      useCases.productView as any,
      useCases.categoryIntent as any,
      useCases.cartStatus as any,
      useCases.weekendWindow as any,
      useCases.geoSegment as any,
      useCases.subscriptionStatus as any,
      useCases.subscriptionPlan as any,
      logger
    );

    const unsupportedEvent = {
      type: 'UnknownEvent',
      source: 'test',
      payload: {},
      id: 'id',
      timestamp: new Date(),
    } as any;

    expect(localHandler.canHandle(unsupportedEvent)).toBe(false);
    await localHandler.handleAsync(unsupportedEvent);
    expect(logger.warn).toHaveBeenCalled();
  });
});


