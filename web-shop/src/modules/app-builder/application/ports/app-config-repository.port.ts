import type { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';

export interface AppConfigRepositoryPort {
  getByAppId(appId: string): Promise<Result<AppConfig | null, Error>>;
  getListByAppId(appId: string): Promise<Result<AppConfig[], Error>>;
  save(config: AppConfig): Promise<Result<AppConfig, Error>>;
  update(id: string, config: Partial<AppConfig>): Promise<Result<AppConfig, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
  publish(id: string): Promise<Result<AppConfig, Error>>;
  deactivateAllForApp(exceptId: string): Promise<Result<void, Error>>;
}
