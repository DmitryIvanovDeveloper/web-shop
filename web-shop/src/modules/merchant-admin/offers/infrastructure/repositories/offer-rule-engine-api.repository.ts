import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { OfferRuleEngineRepositoryPort } from '../../application/ports/offer-rule-engine-repository.port';
import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { PublishRuleTreeResponse } from '../../application/dtos/offer-scenarios.dto';

const API_URL = '/api/merchant-admin/offers/publish';

@injectable()
export class OfferRuleEngineApiRepository implements OfferRuleEngineRepositoryPort {
  public constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient
  ) {}

  public async loadRuleTree(appId: string): Promise<Result<OfferRuleTree | null, Error>> {
    try {
      const response = await this._httpClient.get<{ ruleTree: OfferRuleTree | null }>(
        `/api/merchant-admin/offers/rules?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        return Result.error(new Error(`Failed to load rule tree (status ${response.status})`));
      }

      const ruleTree = response.data?.ruleTree ?? null;
      return Result.ok(ruleTree);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async saveRuleTree(tree: OfferRuleTree): Promise<Result<void, Error>> {
    try {
      const response = await this._httpClient.post<PublishRuleTreeResponse>(API_URL, {
        appId: tree.appId,
        ruleTree: tree,
      });

      if (response.status !== 200) {
        return Result.error(new Error(`Failed to publish rule tree (status ${response.status})`));
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error as Error);
    }
  }
}






