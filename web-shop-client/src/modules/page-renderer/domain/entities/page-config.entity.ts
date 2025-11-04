import type { PageSection } from './page-section';

/**
 * Page Configuration Entity
 * Represents a complete page configuration with sections
 */
export interface PageConfig {
  id: string;
  appId: string;
  pageSlug: string;
  sections: PageSection[];
  isDraft: boolean;
  isActive: boolean;
  version: number;
  /** Optional page-level styles (applied to the page container) */
  pageStyles?: {
    padding?: string;
    gap?: string;
  };
}

