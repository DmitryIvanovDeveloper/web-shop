import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { AppConfigRepositoryPort } from '../ports/app-config-repository.port';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { AppConfig } from '../../domain/entities/app-config.entity';

export interface GetAppConfigsListRequest {
  readonly appId: string;
}

@injectable()
export class GetAppConfigsListUseCase {
  constructor(
    @inject(APP_BUILDER_TYPES.AppConfigRepository)
    private readonly repository: AppConfigRepositoryPort
  ) {}

  public async execute(request: GetAppConfigsListRequest): Promise<Result<AppConfig[], Error>> {
    if (!request.appId || request.appId.trim() === '') {
      return Result.error(new Error('App ID is required'));
    }

    return this.repository.getListByAppId(request.appId);
  }
}