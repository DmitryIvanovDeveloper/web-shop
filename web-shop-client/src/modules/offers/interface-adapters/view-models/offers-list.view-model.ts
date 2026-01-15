import type { Offer } from '../../domain/types';

export interface OffersLabels {
  offersTitle: string;
  emptyState: string;
  loadingState: string;
  featuredTitle: string;
  expiredBadge: string;
}

export type OffersListViewModel =
  | { readonly status: 'loading'; readonly labels: OffersLabels }
  | { readonly status: 'success'; readonly offers: readonly Offer[]; readonly labels: OffersLabels }
  | { readonly status: 'error'; readonly message: string; readonly labels: OffersLabels };
