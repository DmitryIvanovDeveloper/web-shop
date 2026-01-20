import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/result/result';
import { Project, MerchantId, ProjectId, ProjectSelectedEvent } from '../../domain';
import type { ProjectRepositoryPort } from '../../application';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../../application/ports/event-bus.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';

export interface SelectActiveProjectRequest {
  readonly merchantId: string;
  readonly projectId: string;
}

export interface SelectActiveProjectResponse {
  readonly project: Project;
}

@injectable()
export class SelectActiveProjectUseCase {
  constructor(
    @inject(PROJECT_TYPES.ProjectRepository)
    private readonly _projectRepository: ProjectRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus
  ) {}

  async execute(request: SelectActiveProjectRequest): Promise<Result<SelectActiveProjectResponse, Error>> {
    try {
      const merchantId = MerchantId.fromString(request.merchantId);
      const projectId = ProjectId.fromString(request.projectId);

      const projectResult = await this._projectRepository.findById(projectId);
      if (projectResult.isFailure) {
        return Result.error(projectResult.error!);
      }

      const selectedProject = projectResult.value!;
      if (!selectedProject.isActive()) {
        return Result.error(new Error('Cannot select inactive project'));
      }

      const activeResult = await this._projectRepository.findActiveByMerchantId(merchantId);
      if (activeResult.isFailure) {
        return Result.error(activeResult.error!);
      }

      const currentActiveProject = activeResult.value;

      if (currentActiveProject && currentActiveProject.id.equals(selectedProject.id)) {
        return Result.ok({ project: selectedProject });
      }

      await this._eventBus.publishSync(
        new ProjectSelectedEvent(
          merchantId.value,
          selectedProject.id.value,
          selectedProject.appId.value,
          selectedProject.name
        )
      );

      return Result.ok({
        project: selectedProject
      });
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
