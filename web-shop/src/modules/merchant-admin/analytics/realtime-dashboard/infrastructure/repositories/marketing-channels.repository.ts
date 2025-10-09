import { MarketingChannelsRepositoryPort } from '../../application/ports/marketing-channels-repository.port';
import { MarketingChannelsSummary } from '../../domain/entities/marketing-channels-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class MarketingChannelsRepository implements MarketingChannelsRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getMarketingChannelsSummary(): Promise<MarketingChannelsSummary> {
    const response = await this.httpClient.get<any>('/api/marketing-channels/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch marketing channels data: ${response.statusText}`);
    }

    return MarketingChannelsSummary.fromApiResponse(response.data);
  }
}

