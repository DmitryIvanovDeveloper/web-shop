import type { Container } from 'inversify';
import { LOCALIZATION_TYPES } from './types';

import { LanguageHttpRepository } from '../repositories/language-http.repository';
import { TranslationHttpRepository } from '../repositories/translation-http.repository';

import { LoadLocalizationUseCase, ChangeLocalizationUseCase } from '../../application/use-cases';

import { LocalizationPresenter } from '../../interface-adapters/presenters/localization.presenter';
import { LocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { LocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../domain/events/localization-changed.event';

export function bindLocalization(container: Container): void {
    container
    .bind(LOCALIZATION_TYPES.LanguageRepository)
    .to(LanguageHttpRepository)
    .inSingletonScope();

  container
    .bind(LOCALIZATION_TYPES.TranslationRepository)
    .to(TranslationHttpRepository)
    .inSingletonScope();

    container
    .bind(LOCALIZATION_TYPES.LoadLocalizationUseCase)
    .to(LoadLocalizationUseCase)
    .inSingletonScope();

  container
    .bind(LOCALIZATION_TYPES.ChangeLocalizationUseCase)
    .to(ChangeLocalizationUseCase)
    .inSingletonScope();

    container
    .bind(LOCALIZATION_TYPES.LocalizationPresenter)
    .to(LocalizationPresenter)
    .inSingletonScope();

    container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(LOCALIZATION_TYPES.LocalizationLoadedEventHandler)
    .to(LocalizationLoadedEventHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(LOCALIZATION_TYPES.LocalizationChangedEventHandler)
    .to(LocalizationChangedEventHandler)
    .inTransientScope();
}