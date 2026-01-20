import { inject, injectable } from 'inversify';
import type { FirstPaymentCompletedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleFirstPaymentCompletedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: FirstPaymentCompletedEvent): Promise<void> {
    const { appId, userId, totalSpend, purchaseCount } = event.payload;
    await this.writer.upsert(appId, userId, {
      'user.flags.isFirstPayment': true,
      'user.flags.isNew': false,       'user.purchases.length': purchaseCount,
      'user.metrics.totalSpend': totalSpend,
    });
  }
}


