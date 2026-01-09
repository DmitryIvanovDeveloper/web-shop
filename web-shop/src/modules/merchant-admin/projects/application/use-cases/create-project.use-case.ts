import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/result/result';
import { Project, AppId, MerchantId, ProjectStatus, ProjectAlreadyExistsError, ProjectCreatedEvent } from '../../domain';
import type { ProjectRepositoryPort } from '../../application';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';

export interface CreateProjectRequest {
  readonly merchantId: string;
  readonly appId: string;
  readonly name: string;
  readonly description?: string;
}

export interface CreateProjectResponse {
  readonly project: Project;
}

@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(PROJECT_TYPES.ProjectRepository)
    private readonly _projectRepository: ProjectRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(request: CreateProjectRequest): Promise<Result<CreateProjectResponse, Error>> {
    try {
      const appId = AppId.create(request.appId);
      const merchantId = MerchantId.fromString(request.merchantId);

      // Check if project with this app_id already exists
      const existsResult = await this._projectRepository.existsByAppId(appId);
      if (existsResult.isFailure) {
        return Result.error(existsResult.error!);
      }

      if (existsResult.value!) {
        return Result.error(new ProjectAlreadyExistsError(appId.value));
      }

      // Create project
      const projectResult = Project.create({
        appId,
        name: request.name,
        description: request.description,
        status: ProjectStatus.create('active'), // New projects are active by default
        merchantId
      });

      if (projectResult.isFailure) {
        return Result.error(projectResult.error!);
      }

      const project = projectResult.value!;

      // Save to repository
      const saveResult = await this._projectRepository.save(project);
      if (saveResult.isFailure) {
        return Result.error(saveResult.error!);
      }

      // Publish project created event
      await this._eventBus.publishSync(
        new ProjectCreatedEvent(
          project.id.value,
          merchantId.value,
          appId.value,
          project.name
        )
      );

      return Result.ok({
        project: saveResult.value!
      });
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}