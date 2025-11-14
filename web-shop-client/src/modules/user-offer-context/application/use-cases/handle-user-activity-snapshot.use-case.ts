import { inject, injectable } from 'inversify';
import type { UserActivitySnapshotEvent } from '../../domain/events/user-offer-context.events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextWriterPort } from '../ports/user-offer-context-writer.port';

@injectable()
export class HandleUserActivitySnapshotUseCase {
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.ContextWriter)
    private readonly writer: UserOfferContextWriterPort
  ) {}

  public async execute(event: UserActivitySnapshotEvent): Promise<void> {
    const { appId, userId, daysSinceLastActive, weeklySessions, dailyActiveMinutes } = event.payload;
    await this.writer.upsert(appId, userId, {
      'user.metrics.daysSinceLastActive': daysSinceLastActive,
      'user.metrics.weeklySessions': weeklySessions,
      'user.metrics.dailyActiveMinutes': dailyActiveMinutes,
    });
  }
}


