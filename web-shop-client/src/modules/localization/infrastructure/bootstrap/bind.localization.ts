import type { Container } from 'inversify';
import { LOCALIZATION_TYPES } from './types';

// Repositories
import { LanguageHttpRepository } from '../repositories/language-http.repository';
import { TranslationHttpRepository } from '../repositories/translation-http.repository';

// Use Cases
import { LoadLocalizationUseCase, ChangeLocalizationUseCase } from '../../application/use-cases';

// Presenters
import { LocalizationPresenter } from '../../interface-adapters/presenters/localization.presenter';
import { LocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { LocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../domain/events/localization-changed.event';

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
    .bind(LOCALIZATION_TYPES.LoadLocalizationUseCase)
    .to(LoadLocalizationUseCase)
    .inSingletonScope();

  container
    .bind(LOCALIZATION_TYPES.ChangeLocalizationUseCase)
    .to(ChangeLocalizationUseCase)
    .inSingletonScope();

  // Presenters
  container
    .bind(LOCALIZATION_TYPES.LocalizationPresenter)
    .to(LocalizationPresenter)
    .inSingletonScope();

  // Event Handlers - automatically discovered by EventBus
  container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(LOCALIZATION_TYPES.LocalizationLoadedEventHandler)
    .to(LocalizationLoadedEventHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(LOCALIZATION_TYPES.LocalizationChangedEventHandler)
    .to(LocalizationChangedEventHandler)
    .inTransientScope();
}