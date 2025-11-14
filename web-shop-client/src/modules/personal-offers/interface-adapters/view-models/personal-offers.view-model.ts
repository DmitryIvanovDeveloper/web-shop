import type { Offer } from '../../../offers/domain/types';

export type PersonalOffersStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PersonalOffersViewModel {
  readonly status: PersonalOffersStatus;
  readonly offers: readonly Offer[];
  readonly isVisible: boolean;
  readonly lastUpdatedAt?: string;
  readonly errorMessage?: string;
}


