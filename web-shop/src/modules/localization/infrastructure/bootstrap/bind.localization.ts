import type { Container } from 'inversify';
import { LOCALIZATION_TYPES } from './types';

// Repositories
import { LanguageRepository } from '../repositories/language.repository';
import { TranslationRepository } from '../repositories/translation.repository';

// Use Cases
import { ChangeActiveLanguageUseCase } from '../../application/use-cases/change-active-language.use-case';
import { GetLocalizationStatusUseCase } from '../../application/use-cases/get-localization-status.use-case';
import { UpdateTranslationsUseCase } from '../../application/use-cases/update-translations.use-case';

// Presenters
import { LocalizationPresenter } from '../../interface-adapters/presenters/localization.presenter';

export function bindLocalization(container: Container): void {
  // Repositories
  container
    .bind(LOCALIZATION_TYPES.LanguageRepository)
    .to(LanguageRepository)
    .inSingletonScope();

  container
    .bind(LOCALIZATION_TYPES.TranslationRepository)
    .to(TranslationRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(LOCALIZATION_TYPES.ChangeActiveLanguageUseCase)
    .to(ChangeActiveLanguageUseCase);

  container
    .bind(LOCALIZATION_TYPES.GetLocalizationStatusUseCase)
    .to(GetLocalizationStatusUseCase);

  container
    .bind(LOCALIZATION_TYPES.UpdateTranslationsUseCase)
    .to(UpdateTranslationsUseCase);

  // Presenters
  container
    .bind(LOCALIZATION_TYPES.LocalizationPresenter)
    .to(LocalizationPresenter)
    .inSingletonScope();
}
