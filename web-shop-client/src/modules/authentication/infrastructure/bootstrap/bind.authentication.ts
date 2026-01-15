/**
 * DI Bindings для Authentication Module
 */

import { Container } from 'inversify';
import { AuthRepositoryPort } from '../../application/ports/auth-repository.port';
import { AuthRepository } from '../repositories/auth.repository';
import { ValidateAppLoginUseCase } from '../../application/use-cases/validate-app-login.use-case';
import { RestoreSessionUseCase } from '../../application/use-cases/restore-session.use-case';
import { SaveSessionUseCase } from '../../application/use-cases/save-session.use-case';
import { SessionStoragePort } from '../../application/ports/session-storage.port';
import { SessionStorageRepository } from '../repositories/session-storage.repository';
import { AuthPresenter } from '../../interface-adapters/presenters/auth.presenter';
import { AuthUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated.handler';
import { AuthLocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { AuthLocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AUTH_TYPES } from './types';
// Application Service & Event Handler
import { AuthService } from '../../application/services/auth.service';
import { AuthenticationRequiredEventHandler } from '../../interface-adapters/handlers/authentication-required.handler';
import { AuthAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { AuthenticationRequiredEvent, UserAuthenticatedEvent } from '../../domain/events';

export function bindAuthentication(container: Container): void {
  // Repository (Infrastructure)
  container
    .bind<AuthRepositoryPort>(AUTH_TYPES.AuthRepository)
    .to(AuthRepository)
    .inSingletonScope();

  // Session Storage (Infrastructure)
  container
    .bind<SessionStoragePort>(AUTH_TYPES.SessionStorage)
    .to(SessionStorageRepository)
    .inSingletonScope();

  // UseCase (Application)
  container
    .bind<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase)
    .to(ValidateAppLoginUseCase);

  container
    .bind<RestoreSessionUseCase>(AUTH_TYPES.RestoreSessionUseCase)
    .to(RestoreSessionUseCase);

  container
    .bind<SaveSessionUseCase>(AUTH_TYPES.SaveSessionUseCase)
    .to(SaveSessionUseCase);

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
      AUTH_TYPES.AuthenticationRequiredEventHandlerInterface
    )
    .to(AuthenticationRequiredEventHandler)
    .inTransientScope();

  // Event Handler для AppConfigLoadedEvent (получение конфига при старте)
  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
      AUTH_TYPES.AppConfigLoadedEventHandler
    )
    .to(AuthAppConfigLoadedHandler)
    .inTransientScope();

  // Event Handler для LocalizationLoadedEvent (обновление labels при первой загрузке переводов)
  container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(
      AUTH_TYPES.LocalizationLoadedEventHandler
    )
    .to(AuthLocalizationLoadedEventHandler)
    .inTransientScope();

  // Event Handler для LocalizationChangedEvent (обновление labels при смене языка)
  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(
      AUTH_TYPES.LocalizationChangedEventHandler
    )
    .to(AuthLocalizationChangedEventHandler)
    .inTransientScope();
}
