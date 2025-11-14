import { inject, injectable } from 'inversify';
import type { UserReturnedEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleUserReturnedUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: UserReturnedEvent): Promise<void> {
    const { appId, userId, lastActiveAt } = event.payload;
    await this.writer.upsert(appId, userId, {
      'user.flags.isNew': false, // Returning users are not new
      'user.metrics.daysSinceLastActive': this.computeDaysSince(lastActiveAt),
    });
  }

  private computeDaysSince(lastActiveAt: string): number {
    const lastActive = new Date(lastActiveAt).getTime();
    const today = Date.now();
    const diffMs = Math.max(today - lastActive, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor(diffMs / msPerDay);
  }
}


