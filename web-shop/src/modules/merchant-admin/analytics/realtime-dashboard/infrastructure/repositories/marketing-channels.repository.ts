import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { MarketingChannelsSummary } from '../../domain/entities/marketing-channels-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface MarketingChannelsRepositoryPort {
  getMarketingChannelsSummary(): Promise<MarketingChannelsSummary>;
}

@injectable()
export class MarketingChannelsRepository implements MarketingChannelsRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getMarketingChannelsSummary(): Promise<MarketingChannelsSummary> {
    const response = await this.httpClient.get('/api/analytics/marketing-channels.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch marketing channels summary: ${response.statusText}`);
    }

    return MarketingChannelsSummary.fromApiResponse(response.data);
  }
}