import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';

export interface ConversionRepositoryPort {
  getConversionSummary(): Promise<ConversionSummary>;
}