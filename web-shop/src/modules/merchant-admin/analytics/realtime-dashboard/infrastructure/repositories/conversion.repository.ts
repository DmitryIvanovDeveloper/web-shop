import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface ConversionRepositoryPort {
  getConversionSummary(): Promise<ConversionSummary>;
}

@injectable()
export class ConversionRepository implements ConversionRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getConversionSummary(): Promise<ConversionSummary> {
    const response = await this.httpClient.get('/api/analytics/conversion.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch conversion summary: ${response.statusText}`);
    }

    return ConversionSummary.fromApiResponse(response.data);
  }
}