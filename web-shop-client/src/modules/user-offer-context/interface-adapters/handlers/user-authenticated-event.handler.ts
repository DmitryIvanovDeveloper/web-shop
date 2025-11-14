import { inject, injectable } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import type { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import { USER_OFFER_CONTEXT_TYPES } from '../../infrastructure/bootstrap/types';
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
    private readonly userReturned: HandleUserReturnedUseCase
  ) {}

  public canHandle(event: UserAuthenticatedEvent): boolean {
    return event.type === 'UserAuthenticatedEvent';
  }

  public async handleAsync(event: UserAuthenticatedEvent): Promise<void> {
    const isNewUser = event.payload.metadata?.isNewUser ?? false;
    if (isNewUser) {
      await this.userRegistered.execute(
        new UserRegisteredEvent({
          appId: event.appId,
          userId: event.userId,
          registeredAt: event.timestamp.toISOString(),
        })
      );
      return;
    }

    await this.userReturned.execute(
      new UserReturnedEvent({
        appId: event.appId,
        userId: event.userId,
        lastActiveAt: event.timestamp.toISOString(),
      })
    );
  }
}


