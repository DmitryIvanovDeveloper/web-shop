import { inject, injectable } from 'inversify';
import type { PurchaseRecordedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandlePurchaseRecordedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: PurchaseRecordedEvent): Promise<void> {
    const { appId, userId, totalSpend, purchaseCount, source } = event.payload;
    await this.writer.upsert(appId, userId, {
      'user.metrics.totalSpend': totalSpend,
      'user.purchases.length': purchaseCount,
      'user.lastPurchase.source': source ?? 'unknown',
    });
  }
}


