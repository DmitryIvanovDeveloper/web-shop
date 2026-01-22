import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { AppConfigRepositoryPort } from '../ports/app-config-repository.port';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { AppConfig } from '../../domain/entities/app-config.entity';

export interface PublishAppConfigRequest {
  readonly configId: string;
}

@injectable()
export class PublishAppConfigUseCase {
  constructor(
    @inject(APP_BUILDER_TYPES.AppConfigRepository)
    private readonly repository: AppConfigRepositoryPort
  ) {}

  public async execute(request: PublishAppConfigRequest): Promise<Result<AppConfig, Error>> {
    if (!request.configId || request.configId.trim() === '') {
      return Result.error(new Error('Config ID is required'));
    }

    return this.repository.publish(request.configId);
  }
}