import { injectable, inject } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { LanguageRepositoryPort } from '../../application/ports/language-repository.port';
import type { LanguageResponse } from '../../application/input-output/localization.io';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES, ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class LanguageHttpRepository implements LanguageRepositoryPort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async getActiveLanguage(): Promise<Result<LanguageResponse | null, Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Getting active language via HTTP');

      const response = await this._httpClient.get('/api/localization/active-language');

      if (response.status !== 200) {
        this._logger.error('[LanguageHttpRepository] Failed to get active language', {
          status: response.status,
          statusText: response.statusText,
        });
        return Failure.fail(new Error(response.statusText || 'Failed to get active language'));
      }

      const data = response.data;
      if (!data) {
        this._logger.info('[LanguageHttpRepository] No active language found');
        return Success.ok(null);
      }

      this._logger.info('[LanguageHttpRepository] Active language found', { languageCode: (data as LanguageResponse).code });
      return Success.ok(data as LanguageResponse);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error getting active language', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getAllLanguages(): Promise<Result<LanguageResponse[], Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Getting all languages via HTTP');

      const response = await this._httpClient.get('/api/localization/languages');

      if (response.status !== 200) {
        this._logger.error('[LanguageHttpRepository] Failed to get all languages', {
          status: response.status,
          statusText: response.statusText,
        });
        return Failure.fail(new Error(response.statusText || 'Failed to get all languages'));
      }

      const languages = Array.isArray(response.data) ? response.data : [];
      this._logger.info('[LanguageHttpRepository] All languages retrieved', { count: languages.length });
      return Success.ok(languages as LanguageResponse[]);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error getting all languages', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getLanguageByCode(code: string): Promise<Result<LanguageResponse | null, Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Getting language by code via HTTP', { code });

      const response = await this._httpClient.get('/api/localization/languages');

      if (response.status !== 200) {
        this._logger.error('[LanguageHttpRepository] Failed to get languages', {
          status: response.status,
          statusText: response.statusText,
        });
        return Failure.fail(new Error(response.statusText || 'Failed to get languages'));
      }

      const languages = Array.isArray(response.data) ? response.data : [];
      const languageData = languages.find((lang: LanguageResponse) => lang.code === code);

      if (!languageData) {
        this._logger.info('[LanguageHttpRepository] Language not found by code', { code });
        return Success.ok(null);
      }

      this._logger.info('[LanguageHttpRepository] Language found by code', { languageCode: languageData.code });
      return Success.ok(languageData);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error getting language by code', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async setActiveLanguage(code: string): Promise<Result<void, Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Setting active language via HTTP', { code });

      const response = await this._httpClient.post('/api/localization/activate-language', {
        languageCode: code
      });

      if (response.status !== 200) {
        this._logger.error('[LanguageHttpRepository] Failed to activate language', {
          status: response.status,
          statusText: response.statusText,
          code
        });
        return Failure.fail(new Error(response.statusText || 'Failed to activate language'));
      }

      this._logger.info('[LanguageHttpRepository] Language activated successfully', { languageCode: code });
      return Success.ok(undefined);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error setting active language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}