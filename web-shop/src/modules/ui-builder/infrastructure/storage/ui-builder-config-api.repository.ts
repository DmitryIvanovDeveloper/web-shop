import { injectable, inject } from 'inversify';
import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import { ConfigVersion } from '../../domain/value-objects/config-version.vo';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { HttpClient } from '@/application/ports/http-client.port';

interface AppConfigRow {
  id: string;
  app_id: string;
  merchant_id?: string | null;
  version: number | string;
  is_active: boolean;
  is_draft?: boolean;
  config: unknown;
  created_at?: string;
}

@injectable()
export class UiBuilderConfigApiRepository implements ConfigStoragePort {
  constructor(
    @inject(ROOT_TYPES.HttpClient) private readonly _http: HttpClient
  ) {}

  async loadConfig(appId: string): Promise<Result<AppConfig, Error>> {
    // Not used in current flows; placeholder implementation
    return Result.fail(new Error('loadConfig is not implemented for UiBuilderConfigApiRepository'));
  }

  async saveConfig(_config: AppConfig): Promise<Result<void, Error>> {
    // Not used in current flows; placeholder implementation
    return Result.fail(new Error('saveConfig is not implemented for UiBuilderConfigApiRepository'));
  }

  async deactivateConfig(_appId: string): Promise<Result<void, Error>> {
    // Not used in current flows; placeholder implementation
    return Result.ok<void, Error>(undefined as void);
  }

  async getConfigHistory(_appId: string, _limit?: number): Promise<Result<AppConfig[], Error>> {
    // Not used in current flows; placeholder implementation
    return Result.ok<AppConfig[], Error>([]);
  }

  async saveDraft(config: AppConfig): Promise<Result<void, Error>> {
    try {
      const response = await this._http.post<{ success: boolean; version: number }>(
        '/api/ui-builder/config/draft',
        {
          appId: config.appId,
          merchantId: config.merchantId,
          config: config.config,
        }
      );

      if (response.status !== 200) {
        return Result.fail(
          new Error(response.data && (response.data as any).error
            ? (response.data as any).error
            : `Failed to save draft: ${response.statusText}`)
        );
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadDraft(appId: string): Promise<Result<AppConfig | null, Error>> {
    try {
      const response = await this._http.get<{ config: AppConfigRow | null }>(
        `/api/ui-builder/config/draft?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        return Result.fail(
          new Error(
            (response.data as any)?.error || `Failed to load draft: ${response.statusText}`
          )
        );
      }

      const row = response.data?.config;
      if (!row) {
        return Result.ok<AppConfig | null, Error>(null);
      }

      const appConfig: AppConfig = {
        id: row.id,
        appId: row.app_id,
        merchantId: row.merchant_id || '',
        version: ConfigVersion.of(Number.parseInt(String(row.version), 10)),
        isDraft: row.is_draft ?? true,
        isActive: row.is_active ?? false,
        config: row.config,
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
      };

      return Result.ok<AppConfig | null, Error>(appConfig);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadActive(appId: string): Promise<Result<AppConfig | null, Error>> {
    try {
      const response = await this._http.get<{ config: AppConfigRow | null }>(
        `/api/ui-builder/config/active?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        return Result.fail(
          new Error(
            (response.data as any)?.error || `Failed to load active config: ${response.statusText}`
          )
        );
      }

      const row = response.data?.config;
      if (!row) {
        return Result.ok<AppConfig | null, Error>(null);
      }

      const appConfig: AppConfig = {
        id: row.id,
        appId: row.app_id,
        merchantId: row.merchant_id || '',
        version: ConfigVersion.of(Number.parseInt(String(row.version), 10)),
        isDraft: row.is_draft ?? false,
        isActive: row.is_active ?? true,
        config: row.config,
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
      };

      return Result.ok<AppConfig | null, Error>(appConfig);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>> {
    try {
      const response = await this._http.post<{ success: boolean; config: unknown }>(
        '/api/ui-builder/config/publish',
        {
          appId,
          draftVersion,
        }
      );

      if (response.status !== 200) {
        return Result.fail(
          new Error(
            (response.data as any)?.error || `Failed to publish draft: ${response.statusText}`
          )
        );
      }

      const config = response.data?.config;
      if (!config) {
        return Result.fail(new Error('Published config payload is missing'));
      }

      // When publishing via API we only need the config payload;
      // use a synthetic AppConfig wrapper for now.
      const appConfig: AppConfig = {
        id: '',
        appId,
        merchantId: '',
        version: ConfigVersion.initial(),
        isDraft: false,
        isActive: true,
        config,
        createdAt: new Date(),
      };

      return Result.ok<AppConfig, Error>(appConfig);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

