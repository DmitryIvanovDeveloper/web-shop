import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { HttpClient } from '@/application/ports/http-client.port';
import { ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { AppConfigRepositoryPort } from '../../application/ports/app-config-repository.port';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { GrapeJsProjectData } from '../../domain/entities/template.entity';
import { createAppConfig } from '../../domain/entities/app-config.entity';

interface AppConfigDto {
  readonly id: string;
  readonly app_id: string;
  readonly merchant_id: string;
  readonly config: GrapeJsProjectData;
  readonly draft_config: GrapeJsProjectData;
  readonly version: number;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

interface AppConfigApiResponse {
  readonly data: AppConfigDto[];
}

@injectable()
export class AppConfigRepository implements AppConfigRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getById(id: string): Promise<Result<AppConfig | null, Error>> {
    try {
      const response = await this.httpClient.get<{ data: AppConfigDto[] }>(
        `/api/app-builder/config?id=${encodeURIComponent(id)}`
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to load app config: ${response.statusText}`)
        );
      }

      const configs = response.data?.data ?? [];
      if (configs.length === 0) {
        return Result.ok(null);
      }

      const entity = this.mapDtoToEntity(configs[0]);
      return Result.ok(entity);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async getByAppId(appId: string): Promise<Result<AppConfig | null, Error>> {
    try {
      const response = await this.httpClient.get<AppConfigApiResponse>(
        `/api/app-builder/config?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to load app config: ${response.statusText}`)
        );
      }

      const configs = response.data?.data ?? [];
      if (configs.length === 0) {
        return Result.ok(null);
      }

      const dto = configs[0];
      const entity = this.mapDtoToEntity(dto);

      return Result.ok(entity);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async getListByAppId(appId: string): Promise<Result<AppConfig[], Error>> {
    try {
      const response = await this.httpClient.get<{ configs: AppConfigDto[] }>(
        `/api/app-builder/configs?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to load app configs: ${response.statusText}`)
        );
      }

      const configs = response.data?.configs ?? [];
      const entities = configs.map(dto => this.mapDtoToEntity(dto));

      return Result.ok(entities);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async save(config: AppConfig): Promise<Result<AppConfig, Error>> {
    try {
      const payload = this.mapEntityToDto(config);

      const response = await this.httpClient.post<AppConfigDto>(
        '/api/app-builder/config',
        payload
      );

      if (response.status !== 200 && response.status !== 201) {
        return Result.error(
          new Error(`Failed to save config: ${response.statusText}`)
        );
      }

      const dto = response.data;
      const entity = this.mapDtoToEntity(dto);

      return Result.ok(entity);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async update(
    id: string,
    config: Partial<AppConfig>
  ): Promise<Result<AppConfig, Error>> {
    try {
      const payload = {
        id,
        ...config,
      };

      const response = await this.httpClient.put<AppConfigDto>(
        '/api/app-builder/config',
        payload
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to update config: ${response.statusText}`)
        );
      }

      const dto = response.data;
      const entity = this.mapDtoToEntity(dto);

      return Result.ok(entity);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async delete(id: string): Promise<Result<void, Error>> {
    try {
      const response = await this.httpClient.delete(
        `/api/app-builder/configs?configId=${encodeURIComponent(id)}`
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to delete app config: ${response.statusText}`)
        );
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async publish(id: string): Promise<Result<AppConfig, Error>> {
    try {
      const response = await this.httpClient.post<AppConfigDto>(
        `/api/app-builder/config/publish/${encodeURIComponent(id)}`,
        {}
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to publish config: ${response.statusText}`)
        );
      }

      const dto = response.data;
      const entity = this.mapDtoToEntity(dto);

      return Result.ok(entity);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async deactivateAllForApp(exceptId: string): Promise<Result<void, Error>> {
    try {
      // Сначала получаем конфигурацию чтобы узнать app_id
      const configResult = await this.getById(exceptId);
      if (configResult.isFailure || !configResult.value) {
        return Result.error(new Error('Config not found'));
      }

      const appId = configResult.value.appId;

      const response = await this.httpClient.put(
        `/api/app-builder/config/deactivate/${encodeURIComponent(appId)}`,
        { exceptId }
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to deactivate configs: ${response.statusText}`)
        );
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  private mapDtoToEntity(dto: AppConfigDto): AppConfig {
    return createAppConfig({
      id: dto.id,
      appId: dto.app_id,
      merchantId: dto.merchant_id,
      config: dto.config,
      draftConfig: dto.draft_config,
      version: dto.version,
      isActive: dto.is_active,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    });
  }

  private mapEntityToDto(entity: AppConfig): Omit<AppConfigDto, 'id' | 'created_at' | 'updated_at'> {
    return {
      app_id: entity.appId,
      merchant_id: entity.merchantId,
      config: entity.config,
      draft_config: entity.draftConfig,
      version: entity.version,
      is_active: entity.isActive,
    };
  }
}
