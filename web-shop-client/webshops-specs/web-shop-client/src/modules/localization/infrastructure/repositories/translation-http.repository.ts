import { injectable, inject } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { TranslationRepositoryPort } from '../../application/ports/translation-repository.port';
import { Translation } from '../../domain/entities/translation.entity';
import { TranslationKey } from '../../domain/value-objects/translation-key';
import { LanguageCode } from '../../domain/value-objects/language-code';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { createClient } from '@supabase/supabase-js';

@injectable()
export class TranslationHttpRepository implements TranslationRepositoryPort {
  private _supabaseClient: any;

  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger
  ) {}

  private get _client() {
    if (!this._supabaseClient) {
      this._supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return this._supabaseClient;
  }

  async getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>> {
    try {
      this._logger.info('[TranslationHttpRepository] Getting translations for language from Supabase', { languageCode });
      const { data, error } = await this._client
        .from('translations')
        .select('*')
        .eq('language_code', languageCode);

      if (error) {
        this._logger.error('[TranslationHttpRepository] Failed to get translations', { languageCode, error });
        return Failure.fail(new Error(`Failed to get translations: ${error.message}`));
      }

      const translations = (data || []).map((row: any) => this._mapRowToEntity(row));
      this._logger.info('[TranslationHttpRepository] Translations retrieved', {
        languageCode,
        count: translations.length
      });
      return Success.ok(translations);
    } catch (error) {
      this._logger.error('[TranslationHttpRepository] Unexpected error getting translations', { error, languageCode });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapRowToEntity(row: any): Translation {
    return Translation.fromDatabase(
      row.id,
      TranslationKey.fromString(row.key),
      LanguageCode.fromString(row.language_code),
      row.value,
      row.is_translated,
      undefined, // context
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
