import type { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';

export interface PageConfigStoragePort {
  
  loadDraft(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>>;

  loadActive(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>>;

  saveDraft(config: PageConfig): Promise<Result<void, Error>>;

  publish(appId: string, pageSlug: string): Promise<Result<void, Error>>;

  listPages(appId: string): Promise<Result<string[], Error>>;
}

