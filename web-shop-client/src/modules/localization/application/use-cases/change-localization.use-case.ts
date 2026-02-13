import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import type { TranslationRepositoryPort } from '../ports/translation-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { LocalizationChangedEvent } from '../../domain/events/localization-changed.event';

export type ChangeLocalizationRequest = {
  languageCode: string;
};

export type ChangeLocalizationResponse = {
  translations: Record<string, string>;
  languageCode: string;
  direction: 'ltr' | 'rtl';
};

@injectable()
export class ChangeLocalizationUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(
    request: ChangeLocalizationRequest
  ): Promise<Result<ChangeLocalizationResponse, Error>> {
    try {
      this._logger.info('[ChangeLocalizationUseCase] Starting localization change', { request });

      const { languageCode } = request;

            if (!/^[a-z]{2,3}$/.test(languageCode)) {
        return Result.error(new Error(`Invalid language code format: ${languageCode}`));
      }

      this._logger.info('[ChangeLocalizationUseCase] Loading translations for new language', { languageCode });

            const translationsResult = await this._translationRepository.getTranslationsByLanguage(languageCode);

      if (translationsResult.isFailure) {
        this._logger.error('[ChangeLocalizationUseCase] Failed to load translations', {
          languageCode,
          error: translationsResult.error
        });
        return Result.error(translationsResult.error);
      }

      const translationEntities = translationsResult.value!;

            const translations: Record<string, string> = {};
      for (const translation of translationEntities) {
        translations[translation.key] = translation.value;
      }

            const navKeys = Object.keys(translations).filter(key => key.startsWith('nav.'));
      this._logger.info('[ChangeLocalizationUseCase] All nav.* keys in translations', {
        navKeys,
        navKeysCount: navKeys.length,
        totalKeys: Object.keys(translations).length,
        navDailyRewards: translations['nav.dailyRewards'],
        navLoyaltyProgram: translations['nav.loyaltyProgram'],
        navNews: translations['nav.news'],
        navUpdates: translations['nav.updates'],
        navEvents: translations['nav.events']
      });

      const direction = languageCode === 'ar' ? 'rtl' : 'ltr';

      const response: ChangeLocalizationResponse = {
        translations,
        languageCode,
        direction
      };

            await this._eventBus.publishAsync(new LocalizationChangedEvent(
        translations,
        languageCode,
        direction
      ));

      this._logger.info('[ChangeLocalizationUseCase] Localization changed and event published', {
        languageCode,
        translationsCount: Object.keys(translations).length,
        direction
      });

      return Result.ok(response);

    } catch (error) {
      this._logger.error('[ChangeLocalizationUseCase] Unexpected error changing localization', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
