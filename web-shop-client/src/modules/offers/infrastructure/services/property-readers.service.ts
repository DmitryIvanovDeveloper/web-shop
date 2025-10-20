import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { ConditionReaderPort } from '../../application/ports/condition-reader.port';
import type { ComparableValue } from '../../domain/types';

@injectable()
export class PropertyReadersService implements ConditionReaderPort {
  private readonly cache: Map<string, ComparableValue> = new Map();

  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async read(propertyPath: string): Promise<ComparableValue> {
    console.log(`[PropertyReadersService] Reading property: ${propertyPath}`);
    if (this.cache.has(propertyPath)) {
      const cached = this.cache.get(propertyPath)!;
      console.log(`[PropertyReadersService] Using cached value: ${cached}`);
      return cached;
    }

    switch (propertyPath) {
      case 'user.purchases.length': {
        console.log(`[PropertyReadersService] Fetching user purchases...`);
        const response = await this.http.get('/api/user/purchases');
        console.log(`[PropertyReadersService] User purchases response:`, response.data);
        const data = response.data;
        const length = Array.isArray(data) ? data.length : ((data as any)?.purchases?.length ?? 0);
        console.log(`[PropertyReadersService] User purchases length: ${length}`);
        this.cache.set(propertyPath, length);
        return length;
      }
      default:
        throw new Error(`Unsupported propertyPath: ${propertyPath}`);
    }
  }
}
