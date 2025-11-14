import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Offer } from '../../domain/types';
import type { OfferRepositoryPort } from '../../application/ports/offer-repository.port';

@injectable()
export class OfferRepository implements OfferRepositoryPort {
  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async getById(offerId: string): Promise<Offer> {
    // offerId is actually a product ID from rule tree
    // Load product from database via API endpoint
    const response = await this.http.get(`/api/products/${encodeURIComponent(offerId)}`);
    
    if (response.status !== 200) {
      throw new Error(`Failed to load product: ${response.statusText || 'Unknown error'}`);
    }
    
    if (!response.data) {
      throw new Error(`Product ${offerId} not found`);
    }
    
    return response.data as Offer;
  }
}
