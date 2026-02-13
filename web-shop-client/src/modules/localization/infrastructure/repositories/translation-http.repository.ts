import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result/result';
import type { TranslationRepositoryPort, Translation } from '../../application/ports/translation-repository.port';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES, ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class TranslationHttpRepository implements TranslationRepositoryPort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>> {
    const maxRetries = 3;
    const retryDelay = 1000; 
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this._logger.info('[TranslationHttpRepository] Getting translations for language via HTTP', {
          languageCode,
          attempt
        });

        const response = await this._httpClient.get(`/api/localization/translations?lang=${languageCode}`);

        if (response.status !== 200) {
                    const isRetryable = response.status >= 500 || response.status === 0;
          const isLastAttempt = attempt === maxRetries;

          if (isRetryable && !isLastAttempt) {
            this._logger.warn('[TranslationHttpRepository] Retryable error, will retry', {
              status: response.status,
              statusText: response.statusText,
              languageCode,
              attempt,
              nextAttemptIn: retryDelay * attempt
            });
            await this._delay(retryDelay * attempt);
            continue;
          }

          this._logger.error('[TranslationHttpRepository] Failed to get translations', {
            status: response.status,
            statusText: response.statusText,
            languageCode,
            attempt
          });
          return Result.error(new Error(response.statusText || 'Failed to get translations'));
        }

        const translations = (Array.isArray(response.data) ? response.data : []).map((item: any) => ({
          key: item.key,
          value: item.value,
          languageCode: item.languageCode,
          isTranslated: item.isTranslated
        }));
        this._logger.info('[TranslationHttpRepository] Translations retrieved', {
          languageCode,
          count: translations.length,
          attempt
        });
        return Result.ok(translations);
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isNetworkError = this._isNetworkError(error);

        if (isNetworkError && !isLastAttempt) {
          this._logger.warn('[TranslationHttpRepository] Network error, will retry', {
            error: error instanceof Error ? error.message : String(error),
            languageCode,
            attempt,
            nextAttemptIn: retryDelay * attempt
          });
          await this._delay(retryDelay * attempt);
          continue;
        }

        this._logger.error('[TranslationHttpRepository] Unexpected error getting translations', {
          error: error instanceof Error ? error.message : String(error),
          languageCode,
          attempt
        });
        return Result.error(error instanceof Error ? error : new Error('Unknown error'));
      }
    }

        return Failure.fail(new Error('Maximum retry attempts exceeded'));
  }

  private async _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updateTranslations(languageCode: string, translations: Array<{
    key: string;
    value: string;
    context?: string;
  }>): Promise<Result<void, Error>> {
    try {
      this._logger.info('[TranslationHttpRepository] Updating translations via HTTP', {
        languageCode,
        count: translations.length
      });

      const response = await this._httpClient.post(
        `/api/localization/translations/update`,
        {
          languageCode,
          translations
        }
      );

      if (response.status !== 200) {
        this._logger.error('[TranslationHttpRepository] Failed to update translations', {
          status: response.status,
          statusText: response.statusText,
          languageCode
        });
        return Result.error(new Error(response.statusText || 'Failed to update translations'));
      }

      this._logger.info('[TranslationHttpRepository] Translations updated successfully', {
        languageCode,
        count: translations.length
      });

      return Result.ok(undefined);
    } catch (error) {
      this._logger.error('[TranslationHttpRepository] Unexpected error updating translations', {
        languageCode,
        error
      });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
            const message = error.message.toLowerCase();
      return message.includes('network') ||
             message.includes('timeout') ||
             message.includes('connection') ||
             message.includes('fetch') ||
             message.includes('aborted');
    }
    return false;
  }
}