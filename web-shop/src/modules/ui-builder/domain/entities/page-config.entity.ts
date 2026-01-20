import type { PageSection } from './page-section.entity';

export interface PageConfig {
  
  id: string;

  appId: string;

  merchantId: string;

  pageSlug: string;

  version: number;

  isDraft: boolean;

  isActive: boolean;

  sections: PageSection[];

  pageStyles?: {
    padding?: string;
    gap?: string;
    backgroundColor?: string;
    backgroundOpacity?: number; 
  };

  metadata?: {
    title?: string;
    description?: string;
    lastModified?: string;
    author?: string;
  };
}

