import { injectable, inject } from 'inversify';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';
import { ConversionRepositoryPort } from '../../application/ports/conversion-repository.port';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

export class ConversionRepository implements ConversionRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  async getConversionSummary(): Promise<ConversionSummary> {
    const response = await this.httpClient.get<any>('/api/conversion/summary');
    return ConversionSummary.fromApiResponse(response.data);
  }
}

