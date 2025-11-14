import { inject, injectable } from 'inversify';
import type { WeeklyPurchaseMetricsCalculatedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleWeeklyPurchaseMetricsCalculatedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: WeeklyPurchaseMetricsCalculatedEvent): Promise<void> {
    const { appId, userId, weeklyPurchaseCount } = event.payload;
    await this.writer.setValue(appId, userId, 'user.metrics.weeklyPurchaseCount', weeklyPurchaseCount);
  }
}


