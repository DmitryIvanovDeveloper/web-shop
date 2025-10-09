import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';
import { ConversionRepositoryPort } from '../../application/ports/conversion-repository.port';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class ConversionRepository implements ConversionRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getConversionSummary(): Promise<ConversionSummary> {
    const response = await this.httpClient.get<any>('/api/conversion/summary');
    return ConversionSummary.fromApiResponse(response.data);
  }
}

