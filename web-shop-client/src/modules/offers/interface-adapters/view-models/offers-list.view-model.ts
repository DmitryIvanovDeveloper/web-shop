import type { Offer } from '../../domain/types';

export type OffersListViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly offers: readonly Offer[] }
  | { readonly status: 'error'; readonly message: string };
