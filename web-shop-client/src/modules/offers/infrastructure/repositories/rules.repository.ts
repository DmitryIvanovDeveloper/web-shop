import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { OfferRuleTree } from '../../domain/types';
import type { RulesRepositoryPort } from '../../application/ports/rules-repository.port';

interface CachedRuleTree {
  readonly ruleTree: OfferRuleTree;
  readonly cachedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

@injectable()
export class RulesRepository implements RulesRepositoryPort {
  private readonly cache = new Map<string, CachedRuleTree>();

  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async loadRules(appId?: string): Promise<OfferRuleTree> {
    const targetAppId = appId;

    if (!targetAppId) {
      throw new Error('App ID is required to load offer rules');
    }

        const cached = this.cache.get(targetAppId);
    if (cached) {
      const age = Date.now() - cached.cachedAt;
      if (age < CACHE_TTL_MS) {
                return cached.ruleTree;
      } else {
                this.cache.delete(targetAppId);
      }
    }

        const url = `/api/offers/rules?appId=${encodeURIComponent(targetAppId)}`;

    try {
      const response = await this.http.get(url);
      if (response.status >= 400) {
        throw new Error(`[RulesRepository] Failed to load rule tree (status ${response.status})`);
      }

      const ruleTree = response.data as OfferRuleTree;
      
            this.cache.set(targetAppId, {
        ruleTree,
        cachedAt: Date.now(),
      });

      return ruleTree;
    } catch (error: unknown) {
      throw this.enrichError(error, targetAppId);
    }
  }

  private enrichError(error: unknown, appId: string): Error {
    if (error instanceof Error) {
      if (!error.message.includes('[RulesRepository]')) {
        error.message = `[RulesRepository] Failed to load rule tree for appId=${appId}: ${error.message}`;
      }
      return error;
    }

    return new Error(`[RulesRepository] Failed to load rule tree for appId=${appId}: ${String(error)}`);
  }
}
