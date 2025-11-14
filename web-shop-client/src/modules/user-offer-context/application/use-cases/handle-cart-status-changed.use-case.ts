import { inject, injectable } from 'inversify';
import type { CartStatusChangedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleCartStatusChangedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: CartStatusChangedEvent): Promise<void> {
    const { appId, userId, status } = event.payload;
    await this.writer.setValue(appId, userId, 'behavior.cart.status', status);
  }
}


