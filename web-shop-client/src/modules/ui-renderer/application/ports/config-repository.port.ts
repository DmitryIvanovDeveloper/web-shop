import type { Result } from '../../../../shared/domain/result/result';
import type { PageConfig } from '../../domain/value-objects/page-config.value-object';
import type { UIRendererError } from '../../domain/errors/ui-renderer.error';

export interface ConfigRepositoryPort {
  getPageConfig(pageType: string): Promise<Result<PageConfig, UIRendererError>>;
}

