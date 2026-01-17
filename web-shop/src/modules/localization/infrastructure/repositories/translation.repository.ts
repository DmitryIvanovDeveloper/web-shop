import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { TranslationRepositoryPort } from '../../application/ports/translation-repository.port';
import { Translation, TranslationKey, LanguageCode } from '../../domain';

interface LanguageApiResponse {
  key: string;
  languageCode: string;
  value: string | null;
  isTranslated: boolean;
  createdAt: string;
  updatedAt: string;
}

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
      const response = await this._httpClient.get<any[]>('/api/localization/translations/all');

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to get all translations: ${response.statusText}`));
      }

      const translations = (response.data || []).map(item => this._mapApiResponseToEntity(item));
      return Success.ok(translations);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslation(key: string, languageCode: string): Promise<Result<Translation | null, Error>> {
    try {
      const response = await this._httpClient.get<any>(`/api/localization/translations/${key}?languageCode=${languageCode}`);

      if (response.status === 404) {
        return Success.ok(null);
      }

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to get translation: ${response.statusText}`));
      }

      const translation = this._mapApiResponseToEntity(response.data);
      return Success.ok(translation);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async upsertTranslation(
    key: string,
    languageCode: string,
    value: string
  ): Promise<Result<{ translation: Translation; wasCreated: boolean }, Error>> {
    try {
      const response = await this._httpClient.post<any>('/api/localization/translations/upsert', {
        key,
        languageCode,
        value
      });

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to upsert translation: ${response.statusText}`));
      }

      const translation = this._mapApiResponseToEntity(response.data.translation);
      return Success.ok({ translation, wasCreated: response.data.wasCreated });
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>> {
    try {
      const response = await this._httpClient.get<LanguageApiResponse[]>('/api/localization/translations/all');

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to get translations: ${response.statusText}`));
      }

      const languageTranslations = (response.data || []).filter(
        (item: LanguageApiResponse) => item.languageCode === languageCode
      );

      const translations: Translation[] = languageTranslations.map(
        (item: LanguageApiResponse) => this._mapApiResponseToEntity(item)
      );

      return Success.ok(translations);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getTranslationCoverage(languageCode: string): Promise<Result<{
    totalKeys: number;
    translatedKeys: number;
    coveragePercentage: number;
  }, Error>> {
    try {
      const response = await this._httpClient.get<{
        totalKeys: number;
        translatedKeys: number;
        coveragePercentage: number;
      }>(`/api/localization/translations/coverage?languageCode=${languageCode}`);

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to calculate coverage: ${response.statusText}`));
      }

      return Success.ok(response.data);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async createTranslation(translation: Translation): Promise<Result<Translation, Error>> {
    try {
      const response = await this._httpClient.post<any>('/api/localization/translations/create', {
        key: translation.key.value,
        languageCode: translation.languageCode.value,
        value: translation.value
      });

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to create translation: ${response.statusText}`));
      }

      const createdTranslation = this._mapApiResponseToEntity(response.data);
      return Success.ok(createdTranslation);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async updateTranslation(key: string, languageCode: string, value: string): Promise<Result<Translation, Error>> {
    try {
      const response = await this._httpClient.put<any>(`/api/localization/translations/${key}`, {
        languageCode,
        value
      });

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to update translation: ${response.statusText}`));
      }

      const updatedTranslation = this._mapApiResponseToEntity(response.data);
      return Success.ok(updatedTranslation);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async bulkUpdateTranslations(updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>): Promise<Result<void, Error>> {
    try {
      const response = await this._httpClient.post<any>('/api/localization/translations/bulk-update', {
        updates
      });

      if (response.status !== 200) {
        return Failure.fail(new Error(`Failed to bulk update translations: ${response.statusText}`));
      }

      return Success.ok(void 0);
    } catch (error) {
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
      throw error;
    }
  }
}

