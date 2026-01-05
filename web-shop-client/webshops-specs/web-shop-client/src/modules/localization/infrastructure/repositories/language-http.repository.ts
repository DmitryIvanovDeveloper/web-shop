import { injectable, inject } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { LanguageRepositoryPort } from '../../application/ports/language-repository.port';
import { Language } from '../../domain/entities/language.entity';
import { LanguageCode } from '../../domain/value-objects/language-code';
import { TextDirection } from '../../domain/value-objects/text-direction';
import { LanguageNotFoundError } from '../../domain/errors/language.error';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { createClient } from '@supabase/supabase-js';

@injectable()
export class LanguageHttpRepository implements LanguageRepositoryPort {
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

  async getActiveLanguage(): Promise<Result<Language | null, Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Getting active language from Supabase');
      const { data, error } = await this._client
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        this._logger.error('[LanguageHttpRepository] Failed to get active language', { error });
        return Failure.fail(new Error(`Failed to get active language: ${error.message}`));
      }

      if (!data) {
        this._logger.info('[LanguageHttpRepository] No active language found');
        return Success.ok(null);
      }

      const language = this._mapRowToEntity(data);
      this._logger.info('[LanguageHttpRepository] Active language found', { languageCode: language.code.value });
      return Success.ok(language);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error getting active language', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getAllLanguages(): Promise<Result<Language[], Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Getting all languages from Supabase');
      const { data, error } = await this._client
        .from('languages')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        this._logger.error('[LanguageHttpRepository] Failed to get all languages', { error });
        return Failure.fail(new Error(`Failed to get all languages: ${error.message}`));
      }

      const languages = (data || []).map((row: any) => this._mapRowToEntity(row));
      this._logger.info('[LanguageHttpRepository] All languages retrieved', { count: languages.length });
      return Success.ok(languages);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error getting all languages', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async getLanguageByCode(code: string): Promise<Result<Language | null, Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Getting language by code from Supabase', { code });
      const { data, error } = await this._client
        .from('languages')
        .select('*')
        .eq('code', code)
        .single();

      if (error && error.code !== 'PGRST116') {
        this._logger.error('[LanguageHttpRepository] Failed to get language by code', { code, error });
        return Failure.fail(new Error(`Failed to get language by code: ${error.message}`));
      }

      if (!data) {
        this._logger.info('[LanguageHttpRepository] Language not found by code', { code });
        return Success.ok(null);
      }

      const language = this._mapRowToEntity(data);
      this._logger.info('[LanguageHttpRepository] Language found by code', { languageCode: language.code.value });
      return Success.ok(language);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error getting language by code', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async setActiveLanguage(code: string): Promise<Result<void, Error>> {
    try {
      this._logger.info('[LanguageHttpRepository] Setting active language in Supabase', { code });

      // Deactivate all other languages
      const { error: deactivateError } = await this._client
        .from('languages')
        .update({ is_active: false })
        .neq('code', code);

      if (deactivateError) {
        this._logger.error('[LanguageHttpRepository] Failed to deactivate other languages', { deactivateError });
        return Failure.fail(new Error(`Failed to deactivate other languages: ${deactivateError.message}`));
      }

      // Activate the target language
      const { data, error: activateError } = await this._client
        .from('languages')
        .update({ is_active: true })
        .eq('code', code)
        .select('*')
        .single();

      if (activateError) {
        this._logger.error('[LanguageHttpRepository] Failed to activate language', { code, activateError });
        return Failure.fail(new Error(`Failed to activate language: ${activateError.message}`));
      }

      if (!data) {
        const error = new LanguageNotFoundError(code);
        this._logger.error('[LanguageHttpRepository] Language not found for activation', { code });
        return Failure.fail(error);
      }

      this._logger.info('[LanguageHttpRepository] Language activated successfully', { languageCode: code });
      return Success.ok(undefined);
    } catch (error) {
      this._logger.error('[LanguageHttpRepository] Unexpected error setting active language', { error, code });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapRowToEntity(row: any): Language {
    return Language.fromDatabase(
      row.code, // id
      LanguageCode.fromString(row.code), // code
      row.name, // name
      row.native_name, // nativeName
      TextDirection.create(row.direction), // direction
      row.is_active, // isActive
      new Date(row.created_at), // createdAt
      new Date(row.updated_at), // updatedAt
      row.fallback_code ? LanguageCode.fromString(row.fallback_code) : undefined, // fallbackCode
      row.flag // flag
    );
  }
}
