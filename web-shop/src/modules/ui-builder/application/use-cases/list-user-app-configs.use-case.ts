import { inject, injectable } from 'inversify';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserAppConfigRepositoryPort, ListUserAppConfigsFilter } from '../ports/user-app-config-repository.port';
import type { UserAppConfigSummary } from '../../domain/entities/user-app-config.entity';
import { Result } from '@/shared/result/result';

@injectable()
export class ListUserAppConfigsUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.UserAppConfigRepository)
    private readonly userAppConfigRepository: UserAppConfigRepositoryPort
  ) {}

  async execute(filter: ListUserAppConfigsFilter): Promise<Result<UserAppConfigSummary[], Error>> {
    try {
      const appConfigs = await this.userAppConfigRepository.list(filter);
      return Result.ok(appConfigs);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Failed to list user app configs'));
    }
  }
}
