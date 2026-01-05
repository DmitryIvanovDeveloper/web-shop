import type { Container } from 'inversify';
import { LOCALIZATION_TYPES } from './types';

// Repositories
import { LanguageHttpRepository } from '../repositories/language-http.repository';
import { TranslationHttpRepository } from '../repositories/translation-http.repository';

// Use Cases
import { ApplyLocalizationUseCase } from '../../application/use-cases/apply-localization.use-case';
import { ChangeActiveLanguageUseCase } from '../../application/use-cases/change-active-language.use-case';
import { UpdateTranslationsUseCaseImpl } from '../../application/use-cases/update-translations.use-case';
import { GetLocalizationStatusUseCaseImpl } from '../../application/use-cases/get-localization-status.use-case';

// Presenters
import { LocalizationPresenter } from '../../interface-adapters/presenters/localization.presenter';
import { LanguageChangedHandler } from '../../interface-adapters/handlers/language-changed.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LanguageChangedEvent } from '../../domain/events/language-changed.event';

export function bindLocalization(container: Container): void {
  // Repositories
  container
    .bind(LOCALIZATION_TYPES.LanguageRepository)
    .to(LanguageHttpRepository)
    .inSingletonScope();

  container
    .bind(LOCALIZATION_TYPES.TranslationRepository)
    .to(TranslationHttpRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(LOCALIZATION_TYPES.ApplyLocalizationUseCase)
    .to(ApplyLocalizationUseCase)
    .inSingletonScope();

  container
    .bind(LOCALIZATION_TYPES.ChangeActiveLanguageUseCase)
    .to(ChangeActiveLanguageUseCase)
    .inSingletonScope();


  // Presenters
  container
    .bind(LOCALIZATION_TYPES.LocalizationPresenter)
    .to(LocalizationPresenter)
    .inSingletonScope();

  // Event Handlers - automatically discovered by EventBus
  container
    .bind<IAsyncEventHandler<LanguageChangedEvent>>(Symbol.for('IAsyncEventHandler<LanguageChangedEvent>'))
    .to(LanguageChangedHandler)
    .inTransientScope();
}