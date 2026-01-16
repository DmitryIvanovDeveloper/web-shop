import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { LanguageRepositoryPort } from '../../application/ports/language-repository.port';
import { Language, LanguageCode, TextDirection } from '../../domain';
import { LanguageNotFoundError, LanguageAlreadyExistsError } from '../../domain/errors/localization.error';

interface LanguageApiResponse {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isActive: boolean;
  fallbackCode?: string;
  flag?: string;
  createdAt: string;
  updatedAt: string;
}

interface LanguageDatabaseRow {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: string;
  is_active: boolean;
  fallback_code?: string;
  flag?: string;
  created_at: string;
  updated_at: string;
}

@injectable()
export class LanguageRepository implements LanguageRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async getByCode(code: string): Promise<Result<Language, Error>> {
    try {
      this._logger.info('[LanguageRepository] Getting language by code via HTTP', { code });

      const response = await this._httpClient.get<LanguageApiResponse | LanguageApiResponse[]>(`/api/localization/languages?code=${code}`);

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to get language', { status: response.status, code });
        return Failure.fail(new Error(`Failed to get language: ${response.statusText}`));
      }

      const data: LanguageApiResponse | LanguageApiResponse[] | null = response.data;
      if (!data) {
        this._logger.info('[LanguageRepository] Language not found', { code });
        return Failure.fail(new LanguageNotFoundError(code));
      }

      // API returns array, so take first element
      const languageData: LanguageApiResponse = Array.isArray(data) ? data[0] : data;
      if (!languageData) {
        this._logger.info('[LanguageRepository] Language not found in response', { code });
        return Failure.fail(new LanguageNotFoundError(code));
      }

      const language: Language = this._mapApiResponseToEntity(languageData);
      this._logger.info('[LanguageRepository] Language found', { code, name: language.name });
      return Success.ok(language);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error getting language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getActiveLanguage(): Promise<Result<Language, Error>> {
    try {
      this._logger.info('[LanguageRepository] Getting active language via HTTP');

      const response = await this._httpClient.get<LanguageApiResponse>('/api/localization/active-language');

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to get active language', { status: response.status });
        return Failure.fail(new Error(`Failed to get active language: ${response.statusText}`));
      }

      const data: LanguageApiResponse | null = response.data;
      if (!data) {
        this._logger.warn('[LanguageRepository] No active language found');
        return Failure.fail(new Error('No active language found'));
      }

      const language: Language = this._mapApiResponseToEntity(data);
      this._logger.info('[LanguageRepository] Active language found', { code: language.code.value, name: language.name });
      return Success.ok(language);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error getting active language', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async activateLanguage(code: string): Promise<Result<void, Error>> {
    try {
      this._logger.info('[LanguageRepository] Activating language via HTTP', { code });

      const response = await this._httpClient.post<{ success: boolean; message: string }>(`/api/localization/activate-language`, {
        languageCode: code
      });

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to activate language', { status: response.status, code });
        return Failure.fail(new Error(`Failed to activate language: ${response.statusText}`));
      }

      this._logger.info('[LanguageRepository] Language activated successfully', { code });
      return Success.ok(void 0);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error activating language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async deactivateLanguage(code: string): Promise<Result<void, Error>> {
    try {
      this._logger.info('[LanguageRepository] Deactivating language via HTTP', { code });

      const response = await this._httpClient.post<{ success: boolean; message: string }>(`/api/localization/deactivate-language`, {
        languageCode: code
      });

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to deactivate language', { status: response.status, code });
        return Failure.fail(new Error(`Failed to deactivate language: ${response.statusText}`));
      }

      this._logger.info('[LanguageRepository] Language deactivated successfully', { code });
      return Success.ok(void 0);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error deactivating language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getAllLanguages(): Promise<Result<Language[], Error>> {
    try {
      this._logger.info('[LanguageRepository] Getting all languages via HTTP');

      const response = await this._httpClient.get<LanguageApiResponse[]>('/api/localization/languages');

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to get languages', { status: response.status });
        return Failure.fail(new Error(`Failed to get languages: ${response.statusText}`));
      }

      const data: LanguageApiResponse[] = response.data || [];
      const languages: Language[] = data.map((item: LanguageApiResponse) => this._mapApiResponseToEntity(item));
      this._logger.info('[LanguageRepository] Languages retrieved', { count: languages.length });
      return Success.ok(languages);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error getting languages', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async createLanguage(language: Language): Promise<Result<Language, Error>> {
    try {
      this._logger.info('[LanguageRepository] Creating language via HTTP', {
        code: language.code.value,
        name: language.name
      });

      const requestData = {
        code: language.code.value,
        name: language.name,
        nativeName: language.nativeName,
        direction: language.direction.value,
        isActive: language.isActive,
        fallbackCode: language.fallbackCode?.value
      };

      const response = await this._httpClient.post<LanguageApiResponse>('/api/localization/languages', requestData);

      if (response.status !== 201) {
        this._logger.error('[LanguageRepository] Failed to create language', { status: response.status });
        return Failure.fail(new Error(`Failed to create language: ${response.statusText}`));
      }

      const createdLanguage: Language = this._mapApiResponseToEntity(response.data);
      this._logger.info('[LanguageRepository] Language created successfully', {
        code: createdLanguage.code.value
      });
      return Success.ok(createdLanguage);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error creating language', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async updateLanguage(
    code: string,
    updates: Partial<{ name: string; nativeName: string; fallbackCode: string }>
  ): Promise<Result<Language, Error>> {
    try {
      this._logger.info('[LanguageRepository] Updating language via HTTP', { code, updates });

      const requestData: Partial<{
        name: string;
        nativeName: string;
        fallbackCode: string;
      }> = {};

      if (updates.name !== undefined) requestData.name = updates.name;
      if (updates.nativeName !== undefined) requestData.nativeName = updates.nativeName;
      if (updates.fallbackCode !== undefined) requestData.fallbackCode = updates.fallbackCode;

      const response = await this._httpClient.put<LanguageApiResponse>(`/api/localization/languages/${code}`, requestData);

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to update language', { status: response.status, code });
        return Failure.fail(new Error(`Failed to update language: ${response.statusText}`));
      }

      const updatedLanguage: Language = this._mapApiResponseToEntity(response.data);
      this._logger.info('[LanguageRepository] Language updated successfully', { code });
      return Success.ok(updatedLanguage);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error updating language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapApiResponseToEntity(response: LanguageApiResponse): Language {
    try {
      return Language.fromDatabase(
        LanguageCode.fromString(response.code),
        response.name,
        response.nativeName,
        TextDirection.fromString(response.direction),
        response.isActive,
        response.fallbackCode ? LanguageCode.fromString(response.fallbackCode) : undefined
      );
    } catch (error) {
      this._logger.error('[LanguageRepository] Error mapping API response to entity', { error, response });
      throw error;
    }
  }

  private _mapRowToEntity(row: LanguageDatabaseRow): Language {
    try {
      return Language.fromDatabase(
        LanguageCode.fromString(row.code),
        row.name,
        row.native_name,
        TextDirection.fromString(row.direction),
        row.is_active,
        row.fallback_code ? LanguageCode.fromString(row.fallback_code) : undefined
      );
    } catch (error) {
      this._logger.error('[LanguageRepository] Error mapping row to entity', { error, row });
      throw error;
    }
  }
}
