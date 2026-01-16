import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { TranslationRepositoryPort } from '../../application/ports/translation-repository.port';
import { Translation, TranslationKey, LanguageCode } from '../../domain';
import { TranslationNotFoundError } from '../../domain/errors/localization.error';

@injectable()
export class TranslationRepository implements TranslationRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async findAll(): Promise<Result<Translation[], Error>> {
    try {
      this._logger.info('[TranslationRepository] Getting all translations via API');

      const response = await this._httpClient.get<any[]>('/api/localization/translations/all');

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to get all translations', { status: response.status });
        return Failure.fail(new Error(`Failed to get all translations: ${response.statusText}`));
      }

      const translations = (response.data || []).map(item => this._mapApiResponseToEntity(item));
      this._logger.info('[TranslationRepository] Found translations', { count: translations.length });
      return Success.ok(translations);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error getting all translations', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslation(key: string, languageCode: string): Promise<Result<Translation | null, Error>> {
    try {
      this._logger.info('[TranslationRepository] Getting translation via API', { key, languageCode });

      const response = await this._httpClient.get<any>(`/api/localization/translations/${key}?languageCode=${languageCode}`);

      if (response.status === 404) {
        this._logger.info('[TranslationRepository] Translation not found', { key, languageCode });
        return Success.ok(null);
      }

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to get translation', { status: response.status, key, languageCode });
        return Failure.fail(new Error(`Failed to get translation: ${response.statusText}`));
      }

      const translation = this._mapApiResponseToEntity(response.data);
      this._logger.info('[TranslationRepository] Translation found', { key, languageCode });
      return Success.ok(translation);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error getting translation', { error, key, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async upsertTranslation(
    key: string,
    languageCode: string,
    value: string
  ): Promise<Result<{ translation: Translation; wasCreated: boolean }, Error>> {
    try {
      this._logger.info('[TranslationRepository] Upserting translation', { key, languageCode });

      const translationKey = TranslationKey.fromString(key);
      const langCode = LanguageCode.fromString(languageCode);
      const translation = Translation.create(translationKey, langCode, value);

      // Try to update first
      const { data: updateData, error: updateError } = await this._databaseClient
        .from('translations')
        .update({
          value: translation.value,
          is_translated: translation.isTranslated,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .eq('language_code', languageCode)
        .select()
        .single();

      if (updateError && updateError.code !== 'PGRST116') {
        // If update failed for reasons other than "not found", try insert
        this._logger.info('[TranslationRepository] Update failed, trying insert', { key, languageCode });

        const translationData = {
          key: translation.key.value,
          language_code: translation.languageCode.value,
          value: translation.value,
          is_translated: translation.isTranslated,
          created_at: translation.createdAt.toISOString(),
          updated_at: translation.updatedAt.toISOString()
        };

        const { data: insertData, error: insertError } = await this._databaseClient
          .from('translations')
          .insert(translationData)
          .select()
          .single();

        if (insertError) {
          this._logger.error('[TranslationRepository] Failed to insert translation', { insertError, key, languageCode });
          return Failure.fail(new Error(`Failed to upsert translation: ${insertError.message}`));
        }

        const createdTranslation = this._mapRowToEntity(insertData);
        this._logger.info('[TranslationRepository] Translation created', { key, languageCode });
        return Success.ok({ translation: createdTranslation, wasCreated: true });
      }

      if (updateData) {
        const updatedTranslation = this._mapRowToEntity(updateData);
        this._logger.info('[TranslationRepository] Translation updated', { key, languageCode });
        return Success.ok({ translation: updatedTranslation, wasCreated: false });
      }

      // This shouldn't happen, but handle gracefully
      this._logger.error('[TranslationRepository] Unexpected state in upsert', { key, languageCode });
      return Failure.fail(new Error('Unexpected error during translation upsert'));
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error upserting translation', { error, key, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>> {
    try {
      this._logger.info('[TranslationRepository] Getting translations by language via HTTP', { languageCode });

      const response = await this._httpClient.get<any[]>(`/api/localization/translations?lang=${languageCode}`);

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to get translations', { status: response.status, languageCode });
        return Failure.fail(new Error(`Failed to get translations: ${response.statusText}`));
      }

      const translations = (response.data || []).map(item => this._mapApiResponseToEntity(item));
      this._logger.info('[TranslationRepository] Translations retrieved', {
        languageCode,
        count: translations.length
      });
      return Success.ok(translations);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error getting translations', { error, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslationCoverage(languageCode: string): Promise<Result<{
    totalKeys: number;
    translatedKeys: number;
    coveragePercentage: number;
  }, Error>> {
    try {
      this._logger.info('[TranslationRepository] Calculating translation coverage via API', { languageCode });

      const response = await this._httpClient.get<{
        totalKeys: number;
        translatedKeys: number;
        coveragePercentage: number;
      }>(`/api/localization/translations/coverage?languageCode=${languageCode}`);

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to calculate coverage', { status: response.status, languageCode });
        return Failure.fail(new Error(`Failed to calculate coverage: ${response.statusText}`));
      }

      this._logger.info('[TranslationRepository] Translation coverage calculated', {
        languageCode,
        ...response.data
      });

      return Success.ok(response.data);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error calculating coverage', { error, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async createTranslation(translation: Translation): Promise<Result<Translation, Error>> {
    try {
      this._logger.info('[TranslationRepository] Creating translation via API', {
        key: translation.key.value,
        languageCode: translation.languageCode.value
      });

      const response = await this._httpClient.post<any>('/api/localization/translations/create', {
        key: translation.key.value,
        languageCode: translation.languageCode.value,
        value: translation.value
      });

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to create translation', { status: response.status });
        return Failure.fail(new Error(`Failed to create translation: ${response.statusText}`));
      }

      const createdTranslation = this._mapApiResponseToEntity(response.data);
      this._logger.info('[TranslationRepository] Translation created successfully', {
        key: translation.key.value,
        languageCode: translation.languageCode.value
      });
      return Success.ok(createdTranslation);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error creating translation', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async updateTranslation(key: string, languageCode: string, value: string): Promise<Result<Translation, Error>> {
    try {
      this._logger.info('[TranslationRepository] Updating translation via API', { key, languageCode });

      const response = await this._httpClient.put<any>(`/api/localization/translations/${key}`, {
        languageCode,
        value
      });

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to update translation', { status: response.status, key, languageCode });
        return Failure.fail(new Error(`Failed to update translation: ${response.statusText}`));
      }

      const updatedTranslation = this._mapApiResponseToEntity(response.data);
      this._logger.info('[TranslationRepository] Translation updated successfully', { key, languageCode });
      return Success.ok(updatedTranslation);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error updating translation', { error, key, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async bulkUpdateTranslations(updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>): Promise<Result<void, Error>> {
    try {
      this._logger.info('[TranslationRepository] Bulk updating translations via API', { count: updates.length });

      const response = await this._httpClient.post<any>('/api/localization/translations/bulk-update', {
        updates
      });

      if (response.status !== 200) {
        this._logger.error('[TranslationRepository] Failed to bulk update translations', { status: response.status });
        return Failure.fail(new Error(`Failed to bulk update translations: ${response.statusText}`));
      }

      this._logger.info('[TranslationRepository] Bulk update completed successfully', {
        count: updates.length,
        updated: response.data.updatedCount,
        created: response.data.createdCount
      });
      return Success.ok(void 0);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error in bulk update', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapApiResponseToEntity(response: any): Translation {
    try {
      return Translation.fromDatabase(
        TranslationKey.fromString(response.key),
        LanguageCode.fromString(response.languageCode),
        response.value,
        response.isTranslated,
        new Date(response.createdAt),
        new Date(response.updatedAt)
      );
    } catch (error) {
      this._logger.error('[TranslationRepository] Error mapping API response to entity', { error, response });
      throw error;
    }
  }

  private _mapRowToEntity(row: any): Translation {
    try {
      return Translation.fromDatabase(
        TranslationKey.fromString(row.key),
        LanguageCode.fromString(row.language_code),
        row.value,
        row.is_translated,
        new Date(row.created_at),
        new Date(row.updated_at)
      );
    } catch (error) {
      this._logger.error('[TranslationRepository] Error mapping row to entity', { error, row });
      throw error;
    }
  }
}

