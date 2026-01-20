import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../../shared/result/result';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { ProjectRepositoryPort } from '../../application';
import {
  Project,
  ProjectId,
  AppId,
  MerchantId,
  ProjectStatus,
  ProjectNotFoundError,
  ProjectAlreadyExistsError
} from '../../domain';

interface ProjectDto {
  id: string;
  app_id: string;
  name: string;
  description?: string;
  status: string;
  merchant_id: string;
  created_at: string;
  updated_at: string;
}

@injectable()
export class SupabaseProjectRepository implements ProjectRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async findById(id: ProjectId): Promise<Result<Project, Error>> {
    try {
            const response = await this._httpClient.get<ProjectDto>(`/api/merchant-admin/projects?id=${id.value}`);

      if (response.status !== 200) {
        if (response.status === 404) {
                    return Failure.fail(new ProjectNotFoundError(id.value));
        }
                return Failure.fail(new Error(`Failed to find project: ${response.statusText}`));
      }

      const data = response.data;
      if (!data) {
                return Failure.fail(new ProjectNotFoundError(id.value));
      }

      const project = this._mapDtoToEntity(data);
            return Success.ok(project);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findByAppId(appId: AppId): Promise<Result<Project, Error>> {
    try {
            const response = await this._httpClient.get<ProjectDto>(`/api/merchant-admin/projects?appId=${appId.value}`);

      if (response.status !== 200) {
        if (response.status === 404) {
                    return Failure.fail(new ProjectNotFoundError(`with app_id ${appId.value}`));
        }
                return Failure.fail(new Error(`Failed to find project by app_id: ${response.statusText}`));
      }

      const data = response.data;
      if (!data) {
                return Failure.fail(new ProjectNotFoundError(`with app_id ${appId.value}`));
      }

      const project = this._mapDtoToEntity(data);
            return Success.ok(project);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findByMerchantId(merchantId: MerchantId): Promise<Result<Project[], Error>> {
    try {
            const response = await this._httpClient.get<ProjectDto[]>(`/api/merchant-admin/projects?merchantId=${merchantId.value}`);

      if (response.status !== 200) {
                return Failure.fail(new Error(`Failed to find projects by merchant: ${response.statusText}`));
      }

      const data = response.data || [];
      const projects = data.map((dto: ProjectDto) => this._mapDtoToEntity(dto));
            return Success.ok(projects);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findActiveByMerchantId(merchantId: MerchantId): Promise<Result<Project | null, Error>> {
    try {
            const response = await this._httpClient.get<ProjectDto[]>(`/api/merchant-admin/projects/active?merchantId=${merchantId.value}`);

      if (response.status !== 200) {
                return Failure.fail(new Error(`Failed to find active project by merchant: ${response.statusText}`));
      }

      const data = response.data;
      if (!data || data.length === 0) {
                return Success.ok(null);
      }

      const project = this._mapDtoToEntity(data[0]);
            return Success.ok(project);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async save(project: Project): Promise<Result<Project, Error>> {
    try {
            const requestData = {
        id: project.id.value,
        appId: project.appId.value,
        name: project.name,
        description: project.description,
        status: project.status.value,
        merchantId: project.merchantId.value,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      };

      const response = await this._httpClient.post<ProjectDto>('/api/merchant-admin/projects', requestData);

      if (response.status >= 400) {
        if (response.status === 409) { 
                    return Failure.fail(new ProjectAlreadyExistsError(project.appId.value));
        }
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to save project: ${errorData?.error || response.statusText}`));
      }

      const savedProject = this._mapDtoToEntity(response.data);
            return Success.ok(savedProject);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async update(id: ProjectId, updates: Partial<{
    name: string;
    description: string;
    status: string;
  }>): Promise<Result<Project, Error>> {
    try {
            const requestData = {
        name: updates.name,
        description: updates.description,
        status: updates.status
      };

      const response = await this._httpClient.put<ProjectDto>(`/api/merchant-admin/projects?id=${id.value}`, requestData);

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to update project: ${errorData?.error || response.statusText}`));
      }

      const updatedProject = this._mapDtoToEntity(response.data);
            return Success.ok(updatedProject);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async delete(id: ProjectId): Promise<Result<void, Error>> {
    try {
            const response = await this._httpClient.delete(`/api/merchant-admin/projects?id=${id.value}`);

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to delete project: ${errorData?.error || response.statusText}`));
      }

            return Success.ok(void 0);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async existsByAppId(appId: AppId): Promise<Result<boolean, Error>> {
    try {
            const response = await this._httpClient.get<{ exists: boolean }>(`/api/merchant-admin/projects/exists?appId=${appId.value}`);

      if (response.status !== 200) {
                return Failure.fail(new Error(`Failed to check app_id existence: ${response.statusText}`));
      }

      const exists = response.data.exists || false;
            return Success.ok(exists);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async existsById(id: ProjectId): Promise<Result<boolean, Error>> {
    try {
            const response = await this._httpClient.get<{ exists: boolean }>(`/api/merchant-admin/projects/exists?id=${id.value}`);

      if (response.status !== 200) {
                return Failure.fail(new Error(`Failed to check project existence: ${response.statusText}`));
      }

      const exists = response.data.exists || false;
            return Success.ok(exists);
    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapDtoToEntity(dto: ProjectDto): Project {
    return Project.fromDatabase({
      id: ProjectId.fromString(dto.id),
      appId: AppId.fromString(dto.app_id),
      name: dto.name,
      description: dto.description,
      status: ProjectStatus.fromString(dto.status),
      merchantId: MerchantId.fromString(dto.merchant_id),
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    });
  }
}