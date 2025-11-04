import type { Result } from '../../../../shared/domain/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';

/**
 * Repository port for loading page configurations
 */
export interface PageConfigRepositoryPort {
  loadByAppIdAndSlug(
    appId: string, 
    pageSlug: string, 
    isDraft: boolean
  ): Promise<Result<PageConfig | null, Error>>;
}

