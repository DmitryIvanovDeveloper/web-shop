import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { AppConfigRepositoryPort } from '../ports/app-config-repository.port';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';

export interface DeleteAppConfigRequest {
  readonly configId: string;
}

@injectable()
export class DeleteAppConfigUseCase {
  constructor(
    @inject(APP_BUILDER_TYPES.AppConfigRepository)
    private readonly repository: AppConfigRepositoryPort
  ) {}

  public async execute(request: DeleteAppConfigRequest): Promise<Result<void, Error>> {
    if (!request.configId || request.configId.trim() === '') {
      return Result.error(new Error('Config ID is required'));
    }

    return this.repository.delete(request.configId);
  }
}