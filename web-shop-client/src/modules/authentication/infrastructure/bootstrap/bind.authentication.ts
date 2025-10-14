/**
 * DI Bindings для Authentication Module
 */

import { Container } from 'inversify';
import { AuthRepositoryPort } from '../../application/ports/auth-repository.port';
import { AuthRepository } from '../repositories/auth.repository';
import { ValidateAppLoginUseCase } from '../../application/use-cases/validate-app-login.use-case';
import { AuthPresenter } from '../../interface-adapters/presenters/auth.presenter';
import { AUTH_TYPES } from './types';

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

  // Presenter (Interface Adapters)
  container
    .bind<AuthPresenter>(AUTH_TYPES.AuthPresenter)
    .to(AuthPresenter);
}
