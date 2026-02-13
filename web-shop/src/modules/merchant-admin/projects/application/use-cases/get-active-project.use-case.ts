import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/result/result';
import { Project, MerchantId } from '../../domain';
import type { ProjectRepositoryPort } from '../../application';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../application/ports/logger.port';

export interface GetActiveProjectRequest {
  readonly merchantId: string;
}

export interface GetActiveProjectResponse {
  readonly project: Project | null;
}

@injectable()
export class GetActiveProjectUseCase {
  constructor(
    @inject(PROJECT_TYPES.ProjectRepository)
    private readonly _projectRepository: ProjectRepositoryPort
  ) {}

  async execute(request: GetActiveProjectRequest): Promise<Result<GetActiveProjectResponse, Error>> {
    try {
      const merchantId = MerchantId.fromString(request.merchantId);
      const result = await this._projectRepository.findActiveByMerchantId(merchantId);

      if (result.isFailure) {
        return Result.error(result.error ?? new Error('Unknown error'));
      }

      return Result.ok({
        project: result.value!
      });
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
