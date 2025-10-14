import { injectable, inject } from 'inversify';
import { MarketingChannelsRepositoryPort } from '../../application/ports/marketing-channels-repository.port';
import { MarketingChannelsSummary } from '../../domain/entities/marketing-channels-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

export class MarketingChannelsRepository implements MarketingChannelsRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getMarketingChannelsSummary(): Promise<MarketingChannelsSummary> {
    const response = await this.httpClient.get<any>('/api/marketing-channels/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch marketing channels data: ${response.statusText}`);
    }

    return MarketingChannelsSummary.fromApiResponse(response.data);
  }
}

