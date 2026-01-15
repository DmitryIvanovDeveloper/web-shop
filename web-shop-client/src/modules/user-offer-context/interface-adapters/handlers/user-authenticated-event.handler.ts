import { inject, injectable } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import type { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { HandleUserRegisteredUseCase } from '../../application/use-cases/handle-user-registered.use-case';
import { HandleUserReturnedUseCase } from '../../application/use-cases/handle-user-returned.use-case';
import {
  UserRegisteredEvent,
  UserReturnedEvent,
} from '../../domain/events/user-offer-context.events';

@injectable()
export class UserAuthenticatedEventHandler
  implements IAsyncEventHandler<UserAuthenticatedEvent>
{
  public constructor(
    @inject(USER_OFFER_CONTEXT_TYPES.HandleUserRegisteredUseCase)
    private readonly userRegistered: HandleUserRegisteredUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.HandleUserReturnedUseCase)
    private readonly userReturned: HandleUserReturnedUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public canHandle(event: UserAuthenticatedEvent): boolean {
    return event.type === 'UserAuthenticatedEvent';
  }

  public async handleAsync(event: UserAuthenticatedEvent): Promise<void> {
    const isNewUser = event.metadata?.isNewUser ?? false;
    if (isNewUser) {
      await this.userRegistered.execute(
        new UserRegisteredEvent({
          appId: event.appId,
          userId: event.userId,
          registeredAt: new Date().toISOString(),
        })
      );
      return;
    }

    // For returning users, use lastActiveAt from event metadata (old value before update)
    // This ensures we use the real last active time, not the current timestamp
    // If not provided in metadata, fallback to current timestamp
    const lastActiveAt = event.metadata?.lastActiveAt ?? new Date().toISOString();
    
    if (event.metadata?.lastActiveAt) {
      this.logger.info('[UserAuthenticatedEventHandler] Using lastActiveAt from event metadata', {
        appId: event.appId,
        userId: event.userId,
        lastActiveAt,
      });
    } else {
      this.logger.warn('[UserAuthenticatedEventHandler] lastActiveAt not in metadata, using current timestamp', {
        appId: event.appId,
        userId: event.userId,
      });
    }

    await this.userReturned.execute(
      new UserReturnedEvent({
        appId: event.appId,
        userId: event.userId,
        lastActiveAt,
      })
    );
  }
}


