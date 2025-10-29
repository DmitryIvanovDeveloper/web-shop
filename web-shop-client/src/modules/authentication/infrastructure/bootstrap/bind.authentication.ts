/**
 * DI Bindings для Authentication Module
 */

import { Container } from 'inversify';
import { AuthRepositoryPort } from '../../application/ports/auth-repository.port';
import { AuthRepository } from '../repositories/auth.repository';
import { ValidateAppLoginUseCase } from '../../application/use-cases/validate-app-login.use-case';
import { AuthPresenter } from '../../interface-adapters/presenters/auth.presenter';
import { AuthUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import { AUTH_TYPES } from './types';
// Application Service & Event Handler
import { AuthService } from '../../application/services/auth.service';
import { AuthenticationRequiredEventHandler } from '../../interface-adapters/handlers/authentication-required.handler';
import { AuthenticationRequiredEvent } from '../../../../shared/events/auth-events';
import { AuthAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';

export function bindAuthentication(container: Container): void {
  // Repository (Infrastructure)
  container
    .bind<AuthRepositoryPort>(AUTH_TYPES.AuthRepository)
    .to(AuthRepository)
    .inSingletonScope();

  // UseCase (Application)
  container
    .bind<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase)
    .to(ValidateAppLoginUseCase);

  // Presenter (Interface Adapters) - Singleton чтобы состояние было общим
  container
    .bind<AuthPresenter>(AUTH_TYPES.AuthPresenter)
    .to(AuthPresenter)
    .inSingletonScope();
    
  // Handler (Interface Adapters) - автоматически подхватывается EventBus
  container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(AUTH_TYPES.UserAuthenticatedHandler)
    .to(AuthUserAuthenticatedHandler)
    .inTransientScope();

  // Application Service (экспорт функциональности для других модулей)
  container
    .bind(AUTH_TYPES.AuthService)
    .to(AuthService)
    .inSingletonScope();

  // Event Handler для AuthenticationRequiredEvent (auto-discovery через EventBus)
  container
    .bind<IAsyncEventHandler<AuthenticationRequiredEvent>>(
      Symbol.for('IAsyncEventHandler<AuthenticationRequiredEvent>')
    )
    .to(AuthenticationRequiredEventHandler)
    .inTransientScope();

  // Event Handler для AppConfigLoadedEvent (получение конфига при старте)
  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
      Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>')
    )
    .to(AuthAppConfigLoadedHandler)
    .inTransientScope();
}
