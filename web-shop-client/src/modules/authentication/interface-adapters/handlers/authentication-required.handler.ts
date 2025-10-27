/**
 * Event Handler для AuthenticationRequiredEvent
 * Обрабатывает запросы на авторизацию от других модулей
 * @injectable - регистрируется в DI и EventBus
 */

import { injectable, inject } from 'inversify';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import { AuthenticationRequiredEvent } from '../../../../shared/events/auth-events';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class AuthenticationRequiredEventHandler implements IAsyncEventHandler<AuthenticationRequiredEvent> {
  constructor(
    @inject(AUTH_TYPES.AuthPresenter)
    private readonly _authPresenter: AuthPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  /**
   * Проверка может ли handler обработать событие
   */
  public canHandle(event: AuthenticationRequiredEvent): boolean {
    return event.type === 'AuthenticationRequiredEvent';
  }

  /**
   * Обработка события AuthenticationRequiredEvent
   * Вызывается когда пользователь пытается выполнить действие требующее авторизации
   */
  public async handleAsync(event: AuthenticationRequiredEvent): Promise<void> {
    this._logger.info('[AuthenticationRequiredEventHandler] Authentication required', {
      source: event.payload.sourceModule,
      action: event.payload.action,
      resourceId: event.payload.resourceId
    });

    // Показываем AuthPopup через Presenter
    this._authPresenter.showAuthPopup();
  }
}

