

import { injectable, inject } from 'inversify';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import type { Logger } from '../../../../application/ports/logger.port';
import { AuthenticationRequiredEvent } from '../../domain/events/authentication-required.event';
import type { SessionStoragePort } from '../../application/ports/session-storage.port';

@injectable()
export class AuthenticationRequiredEventHandler implements IAsyncEventHandler<AuthenticationRequiredEvent> {
  constructor(
    @inject(AUTH_TYPES.AuthPresenter)
    private readonly _authPresenter: AuthPresenter,
    @inject(AUTH_TYPES.SessionStoragePort)
    private readonly _sessionStorage: SessionStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  
  public canHandle(event: AuthenticationRequiredEvent): boolean {
    return event.type === 'AuthenticationRequiredEvent';
  }

  
  public async handleAsync(event: AuthenticationRequiredEvent): Promise<void> {
            const isAuthenticated = this._authPresenter.isUserAuthenticated();
    const currentUser = this._authPresenter.getCurrentUser();
    
    if (isAuthenticated && currentUser) {
      this._logger.info('[AuthenticationRequiredEventHandler] User already authenticated, skipping popup', {
        source: event.sourceModule,
        action: event.action,
        resourceId: event.resourceId,
        userId: currentUser.userId,
        appId: currentUser.appId
      });
      return;
    }

    this._logger.info('[AuthenticationRequiredEventHandler] Authentication required', {
      source: event.sourceModule,
      action: event.action,
      resourceId: event.resourceId
    });

        this._authPresenter.showAuthPopup();
  }
}

