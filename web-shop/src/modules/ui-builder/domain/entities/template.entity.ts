export interface TemplatePageSnapshot {
  pageSlug: string;
  /**
   * Full page configuration snapshot.
   * Structure should be compatible with PageConfig['sections'] + pageStyles.
   */
  pageConfig: unknown;
}

export interface TemplateMetadata {
  description?: string;
  category?: string;
  createdBy?: string;
  previewImageUrl?: string;
  tags?: string[];
  // Allow storing additional metadata without changing the schema
  [key: string]: unknown;
}

/**
 * Global Template for WebShop UI configuration.
 * Represents a reusable combination of app-level config and per-page configs.
 */
export interface Template {
  id: string;
  name: string;

  /**
   * Application-level configuration snapshot.
   * Should be compatible with AppConfig['config'] shape.
   */
  appConfig: unknown;

  /**
   * Page-level configuration snapshots for multiple pages.
   */
  pages: TemplatePageSnapshot[];

  /**
   * Optional structured metadata (description, category, preview image, etc).
   */
  metadata?: TemplateMetadata;

  /**
   * Soft-activation / publication flag for the template catalog.
   */
  isActive: boolean;

  /**
   * Explicit publication state, set to true when admin publishes app config with this template selected.
   */
  published?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}


