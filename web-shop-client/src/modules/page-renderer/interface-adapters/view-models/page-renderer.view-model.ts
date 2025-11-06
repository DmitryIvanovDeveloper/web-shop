import type { PageSection } from '../../domain/entities/page-section';

import type { OfferCardTemplate } from '../../../../shared/config/app-config.types';

export interface PageRendererViewModel {
  sections: PageSection[];
  pageStyles?: {
    padding?: string;
    gap?: string;
  };
  isLoading: boolean;
  error: string | null;
  selectedOfferCardId: string | null;
  offerCards: OfferCardTemplate[];
}

