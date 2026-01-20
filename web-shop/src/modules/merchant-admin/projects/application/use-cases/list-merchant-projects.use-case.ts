import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/result/result';
import { Project, MerchantId } from '../../domain';
import type { ProjectRepositoryPort } from '../../application';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';

export interface ListMerchantProjectsRequest {
  readonly merchantId: string;
}

export interface ListMerchantProjectsResponse {
  readonly projects: readonly Project[];
}

@injectable()
export class ListMerchantProjectsUseCase {
  constructor(
    @inject(PROJECT_TYPES.ProjectRepository)
    private readonly _projectRepository: ProjectRepositoryPort
  ) {}

  async execute(request: ListMerchantProjectsRequest): Promise<Result<ListMerchantProjectsResponse, Error>> {
    try {
      const merchantId = MerchantId.fromString(request.merchantId);
      const result = await this._projectRepository.findByMerchantId(merchantId);

      if (result.isFailure) {
        return Result.error(result.error!);
      }

      const activeProjects = result.value!.filter((project: Project) => project.isActive());

      return Result.ok({
        projects: activeProjects
      });
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
