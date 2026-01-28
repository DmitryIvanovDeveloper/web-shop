import { injectable, inject } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { AppConfigRepositoryPort } from '../../application/ports/app-config-repository.port';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { GrapeJsAppConfig } from '../../../../shared/config/grapejs-app-config.types';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class AppConfigHttpRepository implements AppConfigRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient) private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger) private readonly _logger: Logger
  ) {}

  async loadActiveConfig(appId: string): Promise<Result<GrapeJsAppConfig, Error>> {
    try {
      console.log('[AppConfigHttpRepository] Loading active config via HTTP', { appId });
      this._logger.info('[AppConfigHttpRepository] Loading active config via HTTP', { appId });

      console.log('[AppConfigHttpRepository] Making HTTP request to:', `/api/app-config/${appId}/active`);
      const response = await this._httpClient.get(`/api/app-config/${appId}/active`);
      console.log('[AppConfigHttpRepository] HTTP response received', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      if (response.status !== 200) {
        console.error('[AppConfigHttpRepository] HTTP error', {
          status: response.status,
          statusText: response.statusText,
          appId
        });
        this._logger.error('[AppConfigHttpRepository] Failed to load active config', {
          status: response.status,
          statusText: response.statusText,
          appId
        });
        return Failure.fail(new Error(`Failed to load active config: ${response.statusText}`));
      }

      const config = response.data.config;
      console.log('[AppConfigHttpRepository] Extracted config from response', {
        hasConfig: !!config,
        configType: typeof config,
        configKeys: config ? Object.keys(config) : []
      });

      if (!config) {
        console.warn('[AppConfigHttpRepository] No active config found in response', { appId });
        this._logger.warn('[AppConfigHttpRepository] No active config found in response', { appId });
        return Failure.fail(new Error('Active config not found'));
      }

      console.log('[AppConfigHttpRepository] Active config loaded successfully', { appId });
      this._logger.info('[AppConfigHttpRepository] Active config loaded successfully', { appId });
      return Success.ok(config);
    } catch (error) {
      console.error('[AppConfigHttpRepository] Exception during config load', { error, appId });
      this._logger.error('[AppConfigHttpRepository] Failed to load active config', { error, appId });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadDraftConfig(appId: string): Promise<Result<GrapeJsAppConfig, Error>> {
    try {
      this._logger.info('[AppConfigHttpRepository] Loading draft config via HTTP', { appId });

      const response = await this._httpClient.get(`/api/app-config/${appId}/draft`);

      if (response.status !== 200) {
        this._logger.error('[AppConfigHttpRepository] Failed to load draft config', {
          status: response.status,
          statusText: response.statusText,
          appId
        });
        return Failure.fail(new Error(`Failed to load draft config: ${response.statusText}`));
      }

      const config = response.data.config;
      if (!config) {
        this._logger.warn('[AppConfigHttpRepository] No draft config found in response', { appId });
        return Failure.fail(new Error('Draft config not found'));
      }

      this._logger.info('[AppConfigHttpRepository] Draft config loaded successfully', { appId });
      return Success.ok(config);
    } catch (error) {
      this._logger.error('[AppConfigHttpRepository] Failed to load draft config', { error, appId });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}