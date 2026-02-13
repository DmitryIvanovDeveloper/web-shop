import { inject, injectable } from 'inversify';
import { Result, isFailure, Success, Failure } from '../../../../shared/result/result';
import type { TranslationRepositoryPort } from '../ports/translation-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { LocalizationLoadedEvent } from '../../domain/events/localization-loaded.event';

export type LoadLocalizationRequest = {
  languageCode?: string;
};

export type LoadLocalizationResponse = {
  translations: Record<string, string>;
  languageCode: string;
  direction: 'ltr' | 'rtl';
};

@injectable()
export class LoadLocalizationUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(
    request: LoadLocalizationRequest = {}
  ): Promise<Result<LoadLocalizationResponse, Error>> {
    try {
      this._logger.info('[LoadLocalizationUseCase] Starting localization load', { request });

            const languageCode = request.languageCode || 'en';

      this._logger.info('[LoadLocalizationUseCase] Loading translations', { languageCode });

            const translationsResult = await this._translationRepository.getTranslationsByLanguage(languageCode);

      if (isFailure(translationsResult)) {
        this._logger.error('[LoadLocalizationUseCase] Failed to load translations', {
          languageCode,
          error: translationsResult.error
        });
        return Failure.fail(translationsResult.error);
      }

      const translationEntities = translationsResult.value!;

            const translations: Record<string, string> = {};
      for (const translation of translationEntities) {
        translations[translation.key] = translation.value;
      }

      const direction = languageCode === 'ar' ? 'rtl' : 'ltr';

      const response: LoadLocalizationResponse = {
        translations,
        languageCode,
        direction
      };

            await this._eventBus.publishAsync(new LocalizationLoadedEvent(
        translations,
        languageCode,
        direction
      ));

      this._logger.info('[LoadLocalizationUseCase] Localization loaded and event published', {
        languageCode,
        translationsCount: Object.keys(translations).length,
        direction
      });

      return Success.ok(response);

    } catch (error) {
      this._logger.error('[LoadLocalizationUseCase] Unexpected error loading localization', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

}
