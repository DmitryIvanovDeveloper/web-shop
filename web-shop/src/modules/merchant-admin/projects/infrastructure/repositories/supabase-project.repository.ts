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
      this._logger.info('[SupabaseProjectRepository] Finding project by ID via API', { projectId: id.value });

      const response = await this._httpClient.get<ProjectDto>(`/api/merchant-admin/projects?id=${id.value}`);

      if (response.status !== 200) {
        if (response.status === 404) {
          this._logger.warn('[SupabaseProjectRepository] Project not found via API', { projectId: id.value });
          return Failure.fail(new ProjectNotFoundError(id.value));
        }
        this._logger.error('[SupabaseProjectRepository] Failed to find project via API', { status: response.status, projectId: id.value });
        return Failure.fail(new Error(`Failed to find project: ${response.statusText}`));
      }

      const data = response.data;
      if (!data) {
        this._logger.warn('[SupabaseProjectRepository] No project data in response', { projectId: id.value });
        return Failure.fail(new ProjectNotFoundError(id.value));
      }

      const project = this._mapDtoToEntity(data);
      this._logger.info('[SupabaseProjectRepository] Project found via API', { projectId: id.value, appId: project.appId.value });
      return Success.ok(project);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error finding project via API', { error, projectId: id.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findByAppId(appId: AppId): Promise<Result<Project, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Finding project by App ID via API', { appId: appId.value });

      const response = await this._httpClient.get<ProjectDto>(`/api/merchant-admin/projects?appId=${appId.value}`);

      if (response.status !== 200) {
        if (response.status === 404) {
          this._logger.warn('[SupabaseProjectRepository] Project not found by app_id via API', { appId: appId.value });
          return Failure.fail(new ProjectNotFoundError(`with app_id ${appId.value}`));
        }
        this._logger.error('[SupabaseProjectRepository] Failed to find project by app_id via API', { status: response.status, appId: appId.value });
        return Failure.fail(new Error(`Failed to find project by app_id: ${response.statusText}`));
      }

      const data = response.data;
      if (!data) {
        this._logger.warn('[SupabaseProjectRepository] No project data in response for app_id', { appId: appId.value });
        return Failure.fail(new ProjectNotFoundError(`with app_id ${appId.value}`));
      }

      const project = this._mapDtoToEntity(data);
      this._logger.info('[SupabaseProjectRepository] Project found by app_id via API', { appId: appId.value, projectId: project.id.value });
      return Success.ok(project);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error finding project by app_id via API', { error, appId: appId.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findByMerchantId(merchantId: MerchantId): Promise<Result<Project[], Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Finding projects by merchant ID via API', { merchantId: merchantId.value });

      const response = await this._httpClient.get<ProjectDto[]>(`/api/merchant-admin/projects?merchantId=${merchantId.value}`);

      if (response.status !== 200) {
        this._logger.error('[SupabaseProjectRepository] Failed to find projects by merchant via API', { status: response.status, merchantId: merchantId.value });
        return Failure.fail(new Error(`Failed to find projects by merchant: ${response.statusText}`));
      }

      const data = response.data || [];
      const projects = data.map((dto: ProjectDto) => this._mapDtoToEntity(dto));
      this._logger.info('[SupabaseProjectRepository] Projects found for merchant via API', {
        merchantId: merchantId.value,
        count: projects.length
      });
      return Success.ok(projects);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error finding projects by merchant via API', { error, merchantId: merchantId.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findActiveByMerchantId(merchantId: MerchantId): Promise<Result<Project | null, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Finding active project by merchant ID via API', { merchantId: merchantId.value });

      const response = await this._httpClient.get<ProjectDto[]>(`/api/merchant-admin/projects/active?merchantId=${merchantId.value}`);

      if (response.status !== 200) {
        this._logger.error('[SupabaseProjectRepository] Failed to find active project by merchant via API', { status: response.status, merchantId: merchantId.value });
        return Failure.fail(new Error(`Failed to find active project by merchant: ${response.statusText}`));
      }

      const data = response.data;
      if (!data || data.length === 0) {
        this._logger.info('[SupabaseProjectRepository] No active project found for merchant via API', { merchantId: merchantId.value });
        return Success.ok(null);
      }

      const project = this._mapDtoToEntity(data[0]);
      this._logger.info('[SupabaseProjectRepository] Active project found for merchant via API', {
        merchantId: merchantId.value,
        projectId: project.id.value,
        appId: project.appId.value
      });
      return Success.ok(project);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error finding active project by merchant via API', { error, merchantId: merchantId.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async save(project: Project): Promise<Result<Project, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Saving project via API', {
        projectId: project.id.value,
        appId: project.appId.value,
        name: project.name
      });

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
        if (response.status === 409) { // Conflict - duplicate app_id
          this._logger.warn('[SupabaseProjectRepository] Project with app_id already exists via API', { appId: project.appId.value });
          return Failure.fail(new ProjectAlreadyExistsError(project.appId.value));
        }
        this._logger.error('[SupabaseProjectRepository] Failed to save project via API', { status: response.status, data: response.data });
        const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to save project: ${errorData?.error || response.statusText}`));
      }

      const savedProject = this._mapDtoToEntity(response.data);
      this._logger.info('[SupabaseProjectRepository] Project saved successfully via API', { projectId: savedProject.id.value });
      return Success.ok(savedProject);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error saving project via API', { error, projectId: project.id.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async update(id: ProjectId, updates: Partial<{
    name: string;
    description: string;
    status: string;
  }>): Promise<Result<Project, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Updating project via API', { projectId: id.value, updates });

      const requestData = {
        name: updates.name,
        description: updates.description,
        status: updates.status
      };

      const response = await this._httpClient.put<ProjectDto>(`/api/merchant-admin/projects?id=${id.value}`, requestData);

      if (response.status >= 400) {
        this._logger.error('[SupabaseProjectRepository] Failed to update project via API', { status: response.status, data: response.data, projectId: id.value });
        const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to update project: ${errorData?.error || response.statusText}`));
      }

      const updatedProject = this._mapDtoToEntity(response.data);
      this._logger.info('[SupabaseProjectRepository] Project updated successfully via API', { projectId: updatedProject.id.value });
      return Success.ok(updatedProject);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error updating project via API', { error, projectId: id.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async delete(id: ProjectId): Promise<Result<void, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Deleting project via API', { projectId: id.value });

      const response = await this._httpClient.delete(`/api/merchant-admin/projects?id=${id.value}`);

      if (response.status >= 400) {
        this._logger.error('[SupabaseProjectRepository] Failed to delete project via API', { status: response.status, data: response.data, projectId: id.value });
        const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to delete project: ${errorData?.error || response.statusText}`));
      }

      this._logger.info('[SupabaseProjectRepository] Project deleted successfully via API', { projectId: id.value });
      return Success.ok(void 0);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error deleting project via API', { error, projectId: id.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async existsByAppId(appId: AppId): Promise<Result<boolean, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Checking app_id existence via API', { appId: appId.value });

      const response = await this._httpClient.get<{ exists: boolean }>(`/api/merchant-admin/projects/exists?appId=${appId.value}`);

      if (response.status !== 200) {
        this._logger.error('[SupabaseProjectRepository] Failed to check app_id existence via API', { status: response.status, appId: appId.value });
        return Failure.fail(new Error(`Failed to check app_id existence: ${response.statusText}`));
      }

      const exists = response.data.exists || false;
      this._logger.info('[SupabaseProjectRepository] App_id existence checked via API', { appId: appId.value, exists });
      return Success.ok(exists);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error checking app_id existence via API', { error, appId: appId.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async existsById(id: ProjectId): Promise<Result<boolean, Error>> {
    try {
      this._logger.info('[SupabaseProjectRepository] Checking project existence via API', { projectId: id.value });

      const response = await this._httpClient.get<{ exists: boolean }>(`/api/merchant-admin/projects/exists?id=${id.value}`);

      if (response.status !== 200) {
        this._logger.error('[SupabaseProjectRepository] Failed to check project existence via API', { status: response.status, projectId: id.value });
        return Failure.fail(new Error(`Failed to check project existence: ${response.statusText}`));
      }

      const exists = response.data.exists || false;
      this._logger.info('[SupabaseProjectRepository] Project existence checked via API', { projectId: id.value, exists });
      return Success.ok(exists);
    } catch (error) {
      this._logger.error('[SupabaseProjectRepository] Unexpected error checking project existence via API', { error, projectId: id.value });
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