import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '../../../../application/ports/database-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { LanguageRepositoryPort } from '../../application/ports/language-repository.port';
import { Language, LanguageCode, TextDirection } from '../../domain';
import { LanguageNotFoundError, LanguageAlreadyExistsError } from '../../domain/errors/localization.error';

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

      const response = await this._httpClient.get<any>(`/api/localization/languages?code=${code}`);

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to get language', { status: response.status, code });
        return Failure.fail(new Error(`Failed to get language: ${response.statusText}`));
      }

      const data = response.data;
      if (!data) {
        this._logger.info('[LanguageRepository] Language not found', { code });
        return Failure.fail(new LanguageNotFoundError(code));
      }

      // API returns array, so take first element
      const languageData = Array.isArray(data) ? data[0] : data;
      if (!languageData) {
        this._logger.info('[LanguageRepository] Language not found in response', { code });
        return Failure.fail(new LanguageNotFoundError(code));
      }

      const language = this._mapApiResponseToEntity(languageData);
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

      const response = await this._httpClient.get<any>('/api/localization/active-language');

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to get active language', { status: response.status });
        return Failure.fail(new Error(`Failed to get active language: ${response.statusText}`));
      }

      const data = response.data;
      if (!data) {
        this._logger.warn('[LanguageRepository] No active language found');
        return Failure.fail(new Error('No active language found'));
      }

      const language = this._mapApiResponseToEntity(data);
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

      const response = await this._httpClient.post<any>(`/api/localization/activate-language`, {
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
      this._logger.info('[LanguageRepository] Deactivating language', { code });

      const { error } = await this._databaseClient
        .from('languages')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('code', code);

      if (error) {
        this._logger.error('[LanguageRepository] Failed to deactivate language', { error, code });
        return Failure.fail(new Error(`Failed to deactivate language: ${error.message}`));
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

      const response = await this._httpClient.get<any[]>('/api/localization/languages');

      if (response.status !== 200) {
        this._logger.error('[LanguageRepository] Failed to get languages', { status: response.status });
        return Failure.fail(new Error(`Failed to get languages: ${response.statusText}`));
      }

      const languages = (response.data || []).map(item => this._mapApiResponseToEntity(item));
      this._logger.info('[LanguageRepository] Languages retrieved', { count: languages.length });
      return Success.ok(languages);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error getting languages', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async createLanguage(language: Language): Promise<Result<Language, Error>> {
    try {
      this._logger.info('[LanguageRepository] Creating language', {
        code: language.code.value,
        name: language.name
      });

      const languageData = {
        code: language.code.value,
        name: language.name,
        native_name: language.nativeName,
        direction: language.direction.value,
        is_active: language.isActive,
        fallback_code: language.fallbackCode?.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this._databaseClient
        .from('languages')
        .insert(languageData)
        .select()
        .single();

      if (error) {
        this._logger.error('[LanguageRepository] Failed to create language', { error });
        if (error.code === '23505') { // Unique constraint violation
          return Failure.fail(new LanguageAlreadyExistsError(language.code.value));
        }
        return Failure.fail(new Error(`Failed to create language: ${error.message}`));
      }

      const createdLanguage = this._mapRowToEntity(data);
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
      this._logger.info('[LanguageRepository] Updating language', { code, updates });

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.nativeName !== undefined) updateData.native_name = updates.nativeName;
      if (updates.fallbackCode !== undefined) updateData.fallback_code = updates.fallbackCode;

      const { data, error } = await this._databaseClient
        .from('languages')
        .update(updateData)
        .eq('code', code)
        .select()
        .single();

      if (error) {
        this._logger.error('[LanguageRepository] Failed to update language', { error, code });
        return Failure.fail(new Error(`Failed to update language: ${error.message}`));
      }

      const updatedLanguage = this._mapRowToEntity(data);
      this._logger.info('[LanguageRepository] Language updated successfully', { code });
      return Success.ok(updatedLanguage);
    } catch (error) {
      this._logger.error('[LanguageRepository] Unexpected error updating language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapApiResponseToEntity(response: any): Language {
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

  private _mapRowToEntity(row: any): Language {
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
