import type { Result } from '../../../../shared/domain/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';


export interface PageConfigRepositoryPort {
  loadByAppIdAndSlug(
    appId: string, 
    pageSlug: string, 
    isDraft: boolean
  ): Promise<Result<PageConfig | null, Error>>;
}

