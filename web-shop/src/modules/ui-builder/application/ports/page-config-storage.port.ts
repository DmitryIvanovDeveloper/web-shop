import type { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';

/**
 * Port for page configuration storage operations
 * Defines interface for loading, saving, and publishing page configurations
 */
export interface PageConfigStoragePort {
  /**
   * Load draft page configuration
   * @param appId Application identifier
   * @param pageSlug Page URL slug (e.g., "home")
   * @returns Draft page config or null if not found
   */
  loadDraft(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>>;

  /**
   * Load active (published) page configuration
   * @param appId Application identifier
   * @param pageSlug Page URL slug
   * @returns Active page config or null if not found
   */
  loadActive(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>>;

  /**
   * Save or update draft page configuration
   * @param config Page configuration to save
   * @returns Success or error result
   */
  saveDraft(config: PageConfig): Promise<Result<void, Error>>;

  /**
   * Publish page configuration (make it active)
   * Sets is_active=true and creates new version if needed
   * @param appId Application identifier
   * @param pageSlug Page URL slug
   * @returns Success or error result
   */
  publish(appId: string, pageSlug: string): Promise<Result<void, Error>>;
}

