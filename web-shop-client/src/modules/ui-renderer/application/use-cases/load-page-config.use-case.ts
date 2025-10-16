import { injectable, inject } from 'inversify';
import type { Result } from '../../../../shared/domain/result/result';
import type { PageConfig } from '../../domain/value-objects/page-config.value-object';
import type { UIRendererError } from '../../domain/errors/ui-renderer.error';
import type { ConfigRepositoryPort } from '../ports/config-repository.port';
import { UI_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadPageConfigUseCase {
  constructor(
    @inject(UI_RENDERER_TYPES.ConfigRepository)
    private readonly _configRepository: ConfigRepositoryPort
  ) {}

  public async execute(request: {
    readonly pageType: string;
  }): Promise<Result<PageConfig, UIRendererError>> {
    return await this._configRepository.getPageConfig(request.pageType);
  }
}


