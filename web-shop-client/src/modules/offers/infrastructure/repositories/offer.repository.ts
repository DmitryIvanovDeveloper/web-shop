import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Offer } from '../../domain/types';
import type { OfferRepositoryPort } from '../../application/ports/offer-repository.port';

@injectable()
export class OfferRepository implements OfferRepositoryPort {
  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async getById(offerId: string): Promise<Offer> {
    const response = await this.http.get(`/api/products/offers/${encodeURIComponent(offerId)}`);
    return response.data as Offer;
  }
}
