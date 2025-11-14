import { inject, injectable } from 'inversify';
import type { WeekendPurchaseWindowUpdatedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleWeekendPurchaseWindowUpdatedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: WeekendPurchaseWindowUpdatedEvent): Promise<void> {
    const { appId, userId, isWeekendWindow } = event.payload;
    await this.writer.setValue(appId, userId, 'behavior.isWeekendPurchaseWindow', isWeekendWindow);
  }
}


