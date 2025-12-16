import type { UserAppConfigRepositoryPort } from '../ports/user-app-config-repository.port';
import type { UIBuilderPresenter } from '../../interface-adapters/presenters/ui-builder.presenter';
import { Result } from '@/shared/result/result';

export class ApplyUserAppConfigUseCase {
  constructor(
    private readonly userAppConfigRepository: UserAppConfigRepositoryPort,
    private readonly uiBuilderPresenter: UIBuilderPresenter
  ) {}

  async execute(userAppConfigId: string): Promise<Result<void, Error>> {
    try {
      const userAppConfig = await this.userAppConfigRepository.findById(userAppConfigId);

      if (!userAppConfig) {
        return Result.error(new Error('User app config not found'));
      }

      // Применяем конфигурацию через UIBuilderPresenter
      this.uiBuilderPresenter.applyTemplateConfig(userAppConfig.config);

      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Failed to apply user app config'));
    }
  }
}
