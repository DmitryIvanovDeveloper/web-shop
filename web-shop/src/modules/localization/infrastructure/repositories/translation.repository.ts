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
      this._logger.info('[TranslationRepository] Getting all translations');

      const { data, error } = await this._databaseClient
        .from('translations')
        .select('*')
        .order('key', { ascending: true })
        .order('language_code', { ascending: true });

      if (error) {
        this._logger.error('[TranslationRepository] Failed to get all translations', { error });
        return Failure.fail(new Error(`Failed to get all translations: ${error.message}`));
      }

      const translations = (data || []).map(row => this._mapRowToEntity(row));
      this._logger.info('[TranslationRepository] Found translations', { count: translations.length });
      return Success.ok(translations);
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error getting all translations', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslation(key: string, languageCode: string): Promise<Result<Translation | null, Error>> {
    try {
      this._logger.info('[TranslationRepository] Getting translation', { key, languageCode });

      const { data, error } = await this._databaseClient
        .from('translations')
        .select('*')
        .eq('key', key)
        .eq('language_code', languageCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        this._logger.error('[TranslationRepository] Failed to get translation', { error, key, languageCode });
        return Failure.fail(new Error(`Failed to get translation: ${error.message}`));
      }

      if (!data) {
        this._logger.info('[TranslationRepository] Translation not found', { key, languageCode });
        return Success.ok(null);
      }

      const translation = this._mapRowToEntity(data);
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
      this._logger.info('[TranslationRepository] Calculating translation coverage', { languageCode });

      // Get total keys for this language
      const { data: totalData, error: totalError } = await this._databaseClient
        .from('translations')
        .select('key', { count: 'exact' })
        .eq('language_code', languageCode);

      if (totalError) {
        this._logger.error('[TranslationRepository] Failed to get total keys', { totalError, languageCode });
        return Failure.fail(new Error(`Failed to calculate coverage: ${totalError.message}`));
      }

      // Get translated keys for this language
      const { data: translatedData, error: translatedError } = await this._databaseClient
        .from('translations')
        .select('key', { count: 'exact' })
        .eq('language_code', languageCode)
        .eq('is_translated', true);

      if (translatedError) {
        this._logger.error('[TranslationRepository] Failed to get translated keys', { translatedError, languageCode });
        return Failure.fail(new Error(`Failed to calculate coverage: ${translatedError.message}`));
      }

      const totalKeys = totalData?.length || 0;
      const translatedKeys = translatedData?.length || 0;
      const coveragePercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

      this._logger.info('[TranslationRepository] Translation coverage calculated', {
        languageCode,
        totalKeys,
        translatedKeys,
        coveragePercentage
      });

      return Success.ok({
        totalKeys,
        translatedKeys,
        coveragePercentage
      });
    } catch (error) {
      this._logger.error('[TranslationRepository] Unexpected error calculating coverage', { error, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async createTranslation(translation: Translation): Promise<Result<Translation, Error>> {
    try {
      this._logger.info('[TranslationRepository] Creating translation', {
        key: translation.key.value,
        languageCode: translation.languageCode.value
      });

      const translationData = {
        key: translation.key.value,
        language_code: translation.languageCode.value,
        value: translation.value,
        is_translated: translation.isTranslated,
        created_at: translation.createdAt.toISOString(),
        updated_at: translation.updatedAt.toISOString()
      };

      const { data, error } = await this._databaseClient
        .from('translations')
        .insert(translationData)
        .select()
        .single();

      if (error) {
        this._logger.error('[TranslationRepository] Failed to create translation', { error });
        return Failure.fail(new Error(`Failed to create translation: ${error.message}`));
      }

      const createdTranslation = this._mapRowToEntity(data);
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
      this._logger.info('[TranslationRepository] Updating translation', { key, languageCode });

      const { data, error } = await this._databaseClient
        .from('translations')
        .update({
          value,
          is_translated: true,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .eq('language_code', languageCode)
        .select()
        .single();

      if (error) {
        this._logger.error('[TranslationRepository] Failed to update translation', { error, key, languageCode });
        return Failure.fail(new Error(`Failed to update translation: ${error.message}`));
      }

      const updatedTranslation = this._mapRowToEntity(data);
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
      this._logger.info('[TranslationRepository] Bulk updating translations', { count: updates.length });

      // Process in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);

        for (const update of batch) {
          const result = await this.upsertTranslation(update.key, update.languageCode, update.value);
          if (result.isFailure) {
            this._logger.error('[TranslationRepository] Failed to update translation in batch', {
              key: update.key,
              languageCode: update.languageCode,
              error: result.error
            });
            return Failure.fail(result.error);
          }
        }
      }

      this._logger.info('[TranslationRepository] Bulk update completed successfully', { count: updates.length });
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
