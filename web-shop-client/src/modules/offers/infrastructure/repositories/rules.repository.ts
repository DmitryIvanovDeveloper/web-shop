import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { RuleSet } from '../../domain/types';
import type { RulesRepositoryPort } from '../../application/ports/rules-repository.port';

@injectable()
export class RulesRepository implements RulesRepositoryPort {
  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async loadRules(): Promise<RuleSet> {
    const response = await this.http.get('/api/offers/rules');
    return response.data as RuleSet;
  }
}
