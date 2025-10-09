import { SalesSummary } from './sales-summary.entity';
import { RevenueSummary } from './revenue-summary.entity';
import { GeographySummary } from './geography-summary.entity';
import { ConversionSummary } from './conversion-summary.entity';

export class Dashboard {
  constructor(
    public readonly salesSummary?: SalesSummary,
    public readonly revenueSummary?: RevenueSummary,
    public readonly geographySummary?: GeographySummary,
    public readonly conversionSummary?: ConversionSummary
  ) {}
}
