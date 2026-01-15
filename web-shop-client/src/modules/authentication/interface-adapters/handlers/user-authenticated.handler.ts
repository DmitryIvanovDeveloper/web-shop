import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../domain/events';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { AuthPresenter } from '../presenters/auth.presenter';

@injectable()
export class AuthUserAuthenticatedHandler implements IAsyncEventHandler<UserAuthenticatedEvent> {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(AUTH_TYPES.AuthPresenter)
    private readonly _authPresenter: AuthPresenter
  ) {}

  public canHandle(event: UserAuthenticatedEvent): boolean {
    return event.type === 'UserAuthenticatedEvent';
  }

  public async handleAsync(event: UserAuthenticatedEvent): Promise<void> {
    console.log('[AuthHandler] User authenticated event received', {
      userId: event.userId,
      username: event.username,
      appId: event.appId
    });
    console.log('[AuthHandler] EventBus working correctly - handler is being called');
    
    this._logger.info('[AuthHandler] User authenticated event received', {
      userId: event.userId,
      username: event.username,
      appId: event.appId
    });
    
    // Обновляем состояние презентера - устанавливаем авторизацию
    const user = {
      userId: event.userId,
      username: event.username,
      appId: event.appId
    };
    
    this._authPresenter.setAuthenticated(user);
    
    console.log('[AuthHandler] Authentication state updated in presenter', {
      isAuthenticated: this._authPresenter.isUserAuthenticated(),
      username: this._authPresenter.getCurrentUser()?.username
    });
    
    this._logger.info('[AuthHandler] Authentication state updated in presenter', {
      isAuthenticated: this._authPresenter.isUserAuthenticated(),
      username: this._authPresenter.getCurrentUser()?.username
    });
  }
}
