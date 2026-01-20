import type { PageSection } from './page-section';


export interface PageConfig {
  id: string;
  appId: string;
  pageSlug: string;
  sections: PageSection[];
  isDraft: boolean;
  isActive: boolean;
  version: number;
  
  pageStyles?: {
    padding?: string;
    gap?: string;
  };
}

