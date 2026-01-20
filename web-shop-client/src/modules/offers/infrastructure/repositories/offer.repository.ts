import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Offer } from '../../domain/types';
import type { OfferRepositoryPort } from '../../application/ports/offer-repository.port';

@injectable()
export class OfferRepository implements OfferRepositoryPort {
  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async getById(offerId: string): Promise<Offer> {
            const response = await this.http.get(`/api/products/${encodeURIComponent(offerId)}`);
    
    if (response.status !== 200) {
      throw new Error(`Failed to load product: ${response.statusText || 'Unknown error'}`);
    }
    
    if (!response.data) {
      throw new Error(`Product ${offerId} not found`);
    }
    
    return response.data as Offer;
  }

  public async getByIds(offerIds: readonly string[]): Promise<Offer[]> {
    if (offerIds.length === 0) {
      return [];
    }

    try {
            const response = await this.http.post('/api/products/batch', { ids: offerIds });
      
      if (response.status !== 200) {
        throw new Error(`Failed to load products: ${response.statusText || 'Unknown error'} (status ${response.status})`);
      }
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('[OfferRepository] Batch endpoint returned invalid data format', {
          hasData: !!response.data,
          isArray: Array.isArray(response.data),
          dataType: typeof response.data,
        });
                throw new Error(`Batch endpoint returned invalid data format: expected array, got ${typeof response.data}`);
      }
      
            return response.data as Offer[];
    } catch (error) {
      console.error('[OfferRepository] Batch load failed', {
        error: error instanceof Error ? error.message : String(error),
        offerIdsCount: offerIds.length,
      });
      throw error;     }
  }
}
