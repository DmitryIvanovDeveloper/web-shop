import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/result/result';
import { Project, ProjectId, ProjectUpdatedEvent } from '../../domain';
import type { ProjectRepositoryPort } from '../../application';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../../application/ports/event-bus.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';

export interface UpdateProjectRequest {
  readonly projectId: string;
  readonly name?: string;
  readonly description?: string;
}

export interface UpdateProjectResponse {
  readonly project: Project;
}

@injectable()
export class UpdateProjectUseCase {
  constructor(
    @inject(PROJECT_TYPES.ProjectRepository)
    private readonly _projectRepository: ProjectRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus
  ) {}

  async execute(request: UpdateProjectRequest): Promise<Result<UpdateProjectResponse, Error>> {
    try {
      const projectId = ProjectId.fromString(request.projectId);

      const projectResult = await this._projectRepository.findById(projectId);
      if (projectResult.isFailure) {
        return Result.error(projectResult.error!);
      }

      const currentProject = projectResult.value!;

      const updateResult = currentProject.update({
        name: request.name,
        description: request.description
      });

      if (updateResult.isFailure) {
        return Result.error(updateResult.error!);
      }

      const updatedProject = updateResult.value!;

      const saveResult = await this._projectRepository.update(projectId, {
        name: request.name,
        description: request.description
      });

      if (saveResult.isFailure) {
        return Result.error(saveResult.error!);
      }

      await this._eventBus.publishSync(
        new ProjectUpdatedEvent(
          updatedProject.id.value,
          updatedProject.merchantId.value,
          updatedProject.appId.value,
          updatedProject.name,
          {
            name: request.name,
            description: request.description
          }
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