import type { PageSection } from '../../domain/entities/page-section';

export interface PageRendererViewModel {
  sections: PageSection[];
  pageStyles?: {
    padding?: string;
    gap?: string;
  };
  isLoading: boolean;
  error: string | null;
}

