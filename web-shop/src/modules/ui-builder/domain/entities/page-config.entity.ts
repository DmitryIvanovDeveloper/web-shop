import type { PageSection } from './page-section.entity';

/**
 * Complete page configuration for Page Constructor
 * A page consists of multiple sections (Header, Content, Footer)
 * Each section contains components arranged in a grid layout
 */
export interface PageConfig {
  /** Unique identifier for this page configuration */
  id: string;
  
  /** Application ID this page belongs to */
  appId: string;
  
  /** URL slug for the page (e.g., "home", "about", "products") */
  pageSlug: string;
  
  /** Version number of this configuration */
  version: number;
  
  /** Whether this is a draft version (not published) */
  isDraft: boolean;
  
  /** Whether this is the active/published version */
  isActive: boolean;
  
  /** Array of sections that make up the page */
  sections: PageSection[];
  
  /** Optional metadata about the page */
  metadata?: {
    title?: string;
    description?: string;
    lastModified?: string;
    author?: string;
  };
}

