import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { DatabaseClientPort } from '../../application/ports/database-client.port';
import { ROOT_TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';


@injectable()
export class SupabaseClient implements DatabaseClientPort {
  private static instance: SupabaseClientType | null = null;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    if (!SupabaseClient.instance) {
      this._initializeClient();
    }
  }

  private _initializeClient(): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = 'Supabase URL and Anon Key must be provided. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.';
      this._logger.error('[SupabaseClient] ' + errorMsg);
      throw new Error(errorMsg);
    }

    if (supabaseUrl === 'SET' || supabaseKey === 'SET') {
      const errorMsg = 'Supabase credentials are not properly configured (still showing "SET")';
      this._logger.error('[SupabaseClient] ' + errorMsg);
      throw new Error(errorMsg);
    }

    SupabaseClient.instance = createClient(supabaseUrl, supabaseKey);
    this._logger.info('[SupabaseClient] Supabase client initialized (singleton)');
  }

  public from(table: string): any {
    if (!SupabaseClient.instance) {
      throw new Error('Supabase client not initialized');
    }
    return SupabaseClient.instance.from(table);
  }

  public getClient(): SupabaseClientType {
    if (!SupabaseClient.instance) {
      throw new Error('Supabase client not initialized');
    }
    return SupabaseClient.instance;
  }
}

