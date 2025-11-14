import { describe, it, expect, beforeEach, vi } from 'vitest';
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
import type { UserOfferContextWriterPort } from '../../application/ports/user-offer-context-writer.port';

describe('User offer context use cases', () => {
  let writer: UserOfferContextWriterPort;

  beforeEach(() => {
    writer = {
      upsert: vi.fn(),
      removeKeys: vi.fn(),
      setValue: vi.fn(),
    };
  });

  it('HandleUserRegisteredUseCase sets new user flags', async () => {
    const useCase = new HandleUserRegisteredUseCase(writer);
    const event = new UserRegisteredEvent({
      appId: 'APP123',
      userId: 'user-1',
      registeredAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.upsert).toHaveBeenCalledWith('APP123', 'user-1', {
      'user.flags.isNew': true,
    });
  });

  it('HandleUserReturnedUseCase marks user as returning', async () => {
    const useCase = new HandleUserReturnedUseCase(writer);
    const event = new UserReturnedEvent({
      appId: 'APP123',
      userId: 'user-1',
      lastActiveAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.upsert).toHaveBeenCalledWith(
      'APP123',
      'user-1',
      expect.objectContaining({
        'user.flags.isNew': false,
        'user.metrics.daysSinceLastActive': 0,
      })
    );
  });

  it('HandleFirstPaymentCompletedUseCase updates payment metrics', async () => {
    const useCase = new HandleFirstPaymentCompletedUseCase(writer);
    const event = new FirstPaymentCompletedEvent({
      appId: 'APP123',
      userId: 'user-1',
      paymentId: 'payment-1',
      amount: 9.99,
      occurredAt: new Date().toISOString(),
      totalSpend: 49.99,
      purchaseCount: 3,
    });

    await useCase.execute(event);

    expect(writer.upsert).toHaveBeenCalledWith('APP123', 'user-1', {
      'user.flags.isFirstPayment': true,
      'user.flags.isNew': false,
      'user.purchases.length': 3,
      'user.metrics.totalSpend': 49.99,
    });
  });

  it('HandleMbcLinkStatusChangedUseCase updates flag', async () => {
    const useCase = new HandleMbcLinkStatusChangedUseCase(writer);
    const event = new MbcLinkStatusChangedEvent({
      appId: 'APP123',
      userId: 'user-1',
      isMbcAppUser: true,
      linkedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'user.flags.isMbcAppUser', true);
  });

  it('HandlePurchaseRecordedUseCase updates totals and source', async () => {
    const useCase = new HandlePurchaseRecordedUseCase(writer);
    const event = new PurchaseRecordedEvent({
      appId: 'APP123',
      userId: 'user-1',
      purchaseId: 'purchase-1',
      amount: 4.99,
      occurredAt: new Date().toISOString(),
      source: 'influencer',
      totalSpend: 54.98,
      purchaseCount: 4,
    });

    await useCase.execute(event);

    expect(writer.upsert).toHaveBeenCalledWith('APP123', 'user-1', {
      'user.metrics.totalSpend': 54.98,
      'user.purchases.length': 4,
      'user.lastPurchase.source': 'influencer',
    });
  });

  it('HandleWeeklyPurchaseMetricsCalculatedUseCase stores weekly count', async () => {
    const useCase = new HandleWeeklyPurchaseMetricsCalculatedUseCase(writer);
    const event = new WeeklyPurchaseMetricsCalculatedEvent({
      appId: 'APP123',
      userId: 'user-1',
      weeklyPurchaseCount: 5,
      computedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'user.metrics.weeklyPurchaseCount', 5);
  });

  it('HandleLifetimeSpendMilestoneReachedUseCase stores milestone', async () => {
    const useCase = new HandleLifetimeSpendMilestoneReachedUseCase(writer);
    const event = new LifetimeSpendMilestoneReachedEvent({
      appId: 'APP123',
      userId: 'user-1',
      milestoneReached: 100,
      reachedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'user.metrics.milestoneSpendReached', 100);
  });

  it('HandleUserActivitySnapshotUseCase updates activity metrics', async () => {
    const useCase = new HandleUserActivitySnapshotUseCase(writer);
    const event = new UserActivitySnapshotEvent({
      appId: 'APP123',
      userId: 'user-1',
      daysSinceLastActive: 2,
      weeklySessions: 4,
      dailyActiveMinutes: 120,
      capturedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.upsert).toHaveBeenCalledWith('APP123', 'user-1', {
      'user.metrics.daysSinceLastActive': 2,
      'user.metrics.weeklySessions': 4,
      'user.metrics.dailyActiveMinutes': 120,
    });
  });

  it('HandleProductViewRecordedUseCase stores recent views', async () => {
    const useCase = new HandleProductViewRecordedUseCase(writer);
    const event = new ProductViewRecordedEvent({
      appId: 'APP123',
      userId: 'user-1',
      productId: 'product-1',
      recentViewCount: 3,
      capturedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'behavior.recentProductViews', 3);
  });

  it('HandleCategoryIntentDetectedUseCase stores intent flag', async () => {
    const useCase = new HandleCategoryIntentDetectedUseCase(writer);
    const event = new CategoryIntentDetectedEvent({
      appId: 'APP123',
      userId: 'user-1',
      categoryId: 'weapons',
      hasIntent: true,
      intentDetectedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'behavior.categoryIntent', true);
  });

  it('HandleCartStatusChangedUseCase stores cart status', async () => {
    const useCase = new HandleCartStatusChangedUseCase(writer);
    const event = new CartStatusChangedEvent({
      appId: 'APP123',
      userId: 'user-1',
      status: 'abandoned',
      changedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'behavior.cart.status', 'abandoned');
  });

  it('HandleWeekendPurchaseWindowUpdatedUseCase stores weekend flag', async () => {
    const useCase = new HandleWeekendPurchaseWindowUpdatedUseCase(writer);
    const event = new WeekendPurchaseWindowUpdatedEvent({
      appId: 'APP123',
      userId: 'user-1',
      isWeekendWindow: true,
      updatedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'behavior.isWeekendPurchaseWindow', true);
  });

  it('HandleUserGeoSegmentResolvedUseCase stores geo segment', async () => {
    const useCase = new HandleUserGeoSegmentResolvedUseCase(writer);
    const event = new UserGeoSegmentResolvedEvent({
      appId: 'APP123',
      userId: 'user-1',
      segment: 'high_income',
      resolvedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'geo.segment', 'high_income');
  });

  it('HandleSubscriptionStatusChangedUseCase stores status', async () => {
    const useCase = new HandleSubscriptionStatusChangedUseCase(writer);
    const event = new SubscriptionStatusChangedEvent({
      appId: 'APP123',
      userId: 'user-1',
      status: 'active',
      changedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'user.subscription.status', 'active');
  });

  it('HandleSubscriptionPlanChangedUseCase stores plan', async () => {
    const useCase = new HandleSubscriptionPlanChangedUseCase(writer);
    const event = new SubscriptionPlanChangedEvent({
      appId: 'APP123',
      userId: 'user-1',
      plan: 'monthly',
      changedAt: new Date().toISOString(),
    });

    await useCase.execute(event);

    expect(writer.setValue).toHaveBeenCalledWith('APP123', 'user-1', 'user.subscription.plan', 'monthly');
  });
});


