import { inject, injectable } from 'inversify';
import type { UserRegisteredEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleUserRegisteredUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: UserRegisteredEvent): Promise<void> {
    const { appId, userId } = event.payload;
    await this.writer.upsert(appId, userId, {
      'user.flags.isNew': true,
    });
  }
}


