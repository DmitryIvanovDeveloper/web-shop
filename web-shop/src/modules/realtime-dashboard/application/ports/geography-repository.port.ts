import { GeographySummary } from '../../domain/entities/geography-summary.entity';

export interface GeographyRepositoryPort {
  getGeographySummary(): Promise<GeographySummary>;
}

