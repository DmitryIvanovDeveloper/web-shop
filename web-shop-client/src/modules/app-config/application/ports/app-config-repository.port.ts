import type { Result } from '../../../../shared/result/result';
import type { GrapeJsAppConfig } from '../../../../shared/config/grapejs-app-config.types';

export interface AppConfigRepositoryPort {
  loadActiveConfig(appId: string): Promise<Result<GrapeJsAppConfig, Error>>;
  loadDraftConfig(appId: string): Promise<Result<GrapeJsAppConfig, Error>>;
}