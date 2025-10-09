        import { MarketingChannelsSummary } from '../../domain/entities/marketing-channels-summary.entity';

export interface MarketingChannelsRepositoryPort {
  getMarketingChannelsSummary(): Promise<MarketingChannelsSummary>;
}

