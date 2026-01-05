import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES, ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../application/ports/logger.port';
import type { BrowserLanguageDetectorPort } from '../../application/ports/browser-language-detector.port';
import { LanguageCode } from '../../domain';

/**
 * BrowserLanguageService
 * Implementation of BrowserLanguageDetectorPort for web-shop-client
 */
@injectable()
export class BrowserLanguageService implements BrowserLanguageDetectorPort {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async detectLanguage(): Promise<Result<LanguageCode, Error>> {
    try {
      this._logger.info('[BrowserLanguageService] Detecting user language from browser');

      // Check if we're in browser environment
      if (typeof navigator === 'undefined') {
        const error = new Error('Browser environment not available');
        this._logger.error('[BrowserLanguageService] Not in browser environment', { error });
        return Failure.fail(error);
      }

      // Get language from navigator
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';

      this._logger.info('[BrowserLanguageService] Browser language detected', {
        browserLang,
        allLanguages: navigator.languages
      });

      try {
        const languageCode = LanguageCode.create(browserLang.split('-')[0]); // Remove country code
        this._logger.info('[BrowserLanguageService] Language code created', {
          languageCode: languageCode.value
        });
        return Success.ok(languageCode);
      } catch (error) {
        this._logger.warn('[BrowserLanguageService] Invalid language code from browser', {
          browserLang,
          error
        });
        return Failure.fail(error instanceof Error ? error : new Error('Invalid language code'));
      }
    } catch (error) {
      this._logger.error('[BrowserLanguageService] Unexpected error detecting language', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  getAvailableLanguages(): readonly string[] {
    try {
      if (typeof navigator === 'undefined') {
        this._logger.warn('[BrowserLanguageService] Not in browser environment for getAvailableLanguages');
        return ['en'];
      }

      const languages = navigator.languages || [navigator.language || 'en'];
      this._logger.info('[BrowserLanguageService] Available languages', { languages });

      return languages;
    } catch (error) {
      this._logger.error('[BrowserLanguageService] Error getting available languages', { error });
      return ['en'];
    }
  }

  isLanguageSupported(languageCode: string): boolean {
    try {
      if (typeof navigator === 'undefined') {
        this._logger.warn('[BrowserLanguageService] Not in browser environment for isLanguageSupported');
        return languageCode === 'en';
      }

      const supportedLanguages = this.getAvailableLanguages();
      const isSupported = supportedLanguages.some(lang =>
        lang.startsWith(languageCode) || lang.split('-')[0] === languageCode
      );

      this._logger.info('[BrowserLanguageService] Language support check', {
        languageCode,
        isSupported,
        supportedLanguages
      });

      return isSupported;
    } catch (error) {
      this._logger.error('[BrowserLanguageService] Error checking language support', {
        languageCode,
        error
      });
      return false;
    }
  }
}
