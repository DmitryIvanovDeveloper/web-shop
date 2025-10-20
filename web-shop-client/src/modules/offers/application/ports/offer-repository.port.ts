import type { Offer } from '../../domain/types';

export interface OfferRepositoryPort {
  getById(offerId: string): Promise<Offer>;
}
