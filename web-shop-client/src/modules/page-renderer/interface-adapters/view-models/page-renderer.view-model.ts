import type { PageSection } from '../../domain/entities/page-section';

export interface PageRendererViewModel {
  sections: PageSection[];
  isLoading: boolean;
  error: string | null;
}

