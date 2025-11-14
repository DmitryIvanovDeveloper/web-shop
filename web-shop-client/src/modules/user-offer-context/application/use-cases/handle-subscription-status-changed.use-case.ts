import { inject, injectable } from 'inversify';
import type { SubscriptionStatusChangedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleSubscriptionStatusChangedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: SubscriptionStatusChangedEvent): Promise<void> {
    const { appId, userId, status } = event.payload;
    await this.writer.setValue(appId, userId, 'user.subscription.status', status);
  }
}


