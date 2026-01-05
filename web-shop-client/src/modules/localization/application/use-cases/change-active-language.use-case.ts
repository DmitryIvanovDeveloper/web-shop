import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { LanguageRepositoryPort } from '../ports/language-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import { ApplyLocalizationUseCase } from './apply-localization.use-case';
import { TranslationsConfigEvent } from '../../domain/events/translations-config.event';
import { LanguageCode } from '../../domain/value-objects/language-code';
import { TextDirection } from '../../domain/value-objects/text-direction';

export type ChangeActiveLanguageRequest = {
  languageCode: string;
};

export type ChangeActiveLanguageResponse = {
  languageCode: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, string>;
};

@injectable()
export class ChangeActiveLanguageUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.LanguageRepository)
    private readonly _languageRepository: LanguageRepositoryPort,

    @inject(LOCALIZATION_TYPES.ApplyLocalizationUseCase)
    private readonly _applyLocalizationUseCase: ApplyLocalizationUseCase,

    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,

    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(request: ChangeActiveLanguageRequest): Promise<Result<ChangeActiveLanguageResponse, Error>> {
    try {
      this._logger.info('[ChangeActiveLanguageUseCase] Changing active language and loading translations', { languageCode: request.languageCode });

      // First, load all translations for the new language
      const applyResult = await this._applyLocalizationUseCase.execute({
        languageCode: request.languageCode,
        translationKeys: this._getAllTranslationKeys()
      });

      if (applyResult.failure) {
        this._logger.error('[ChangeActiveLanguageUseCase] Failed to load translations', {
          languageCode: request.languageCode,
          error: (applyResult as any).error
        });
        return Failure.fail((applyResult as any).error || new Error('Failed to load translations'));
      }

      const config = (applyResult as any).data;

      // Publish translations config event for all modules to consume
      await this._eventBus.publishAsync(
        new TranslationsConfigEvent(
          config.translations,
          LanguageCode.fromString(config.languageCode),
          config.direction === 'rtl' ?
            TextDirection.create('rtl') :
            TextDirection.create('ltr')
        )
      );

      this._logger.info('[ChangeActiveLanguageUseCase] Translations config event published successfully', {
        languageCode: request.languageCode,
        translationsCount: Object.keys(config.translations).length
      });

      // Then set the active language in repository
      const result = await this._languageRepository.setActiveLanguage(request.languageCode);

      if (result.failure) {
        this._logger.error('[ChangeActiveLanguageUseCase] Failed to change active language', {
          languageCode: request.languageCode,
          error: (result as any).error
        });
        return Failure.fail((result as any).error || new Error('Failed to change active language'));
      }

      this._logger.info('[ChangeActiveLanguageUseCase] Active language changed successfully', { languageCode: request.languageCode });

      return Success.ok({
        languageCode: config.languageCode,
        direction: config.direction,
        translations: config.translations
      });
    } catch (error) {
      this._logger.error('[ChangeActiveLanguageUseCase] Unexpected error changing active language', {
        languageCode: request.languageCode,
        error
      });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _getAllTranslationKeys(): string[] {
    // Return all known translation keys from the application
    return [
      // Auth module
      'auth.welcomeTitle',
      'auth.welcomeMessage',
      'auth.welcomeSubtitle',
      'auth.enterAppId',
      'auth.appIdPlaceholder',
      'auth.enterUserId',
      'auth.userIdPlaceholder',
      'auth.loginButton',
      'auth.logoutButton',
      'auth.submitButton',
      'auth.agreementText',
      'auth.privacyPolicy',
      'auth.refundPolicy',
      'auth.termsOfService',
      'auth.successMessage',
      'auth.errorMessage',
      'auth.loadingMessage',
      'auth.helpQuestion',
      'auth.helpAnswer',

      // Products module
      'products.title',
      'products.buyButton',
      'products.purchasedBadge',
      'products.emptyState',
      'products.loadingState',

      // Offers module
      'offers.title',
      'offers.featuredTitle',
      'offers.emptyState',
      'offers.expiredBadge'
    ];
  }
}