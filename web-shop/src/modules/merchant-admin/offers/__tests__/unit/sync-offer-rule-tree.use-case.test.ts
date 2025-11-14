import { describe, it, expect } from 'vitest';
import { Result } from '../../../../shared/domain/result/result';
import { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type { OfferScenarioQueryServicePort } from '../../application/ports/offer-scenario-query-service.port';
import type { OfferRuleEngineRepositoryPort } from '../../application/ports/offer-rule-engine-repository.port';
import { SyncOfferRuleTreeUseCase } from '../../application/use-cases/sync-offer-rule-tree.use-case';
import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';

const makeScenario = (slug: string, priority: number): OfferScenario => {
  const result = OfferScenario.create({
    id: slug,
    slug,
    title: 'Scenario ' + slug,
    description: 'Generated scenario',
    categoryCode: 'welcome_retention',
    triggerCode: 'new_user_welcome',
    priority,
    ruleSet: {
      operationType: 'action',
      action: { actionType: 'showOffer', params: { offerId: [slug] } },
    },
    defaultActions: ['discount'],
    configuration: {
      offerIds: [slug + '-offer'],
    },
  });

  if (result.isFailure()) {
    throw result.error;
  }
  return result.data!;
};

class QueryServiceStub implements OfferScenarioQueryServicePort {
  public constructor(private readonly scenarios: OfferScenario[]) {}

  public async loadScenarios(): Promise<Result<readonly OfferScenario[], Error>> {
    return Result.ok(this.scenarios);
  }

  public async loadScenario(_: string, slug: string): Promise<Result<OfferScenario, Error>> {
    const scenario = this.scenarios.find((item) => item.slug === slug);
    return scenario ? Result.ok(scenario) : Result.error(new Error('Not found'));
  }
}

class RuleRepositoryFake implements OfferRuleEngineRepositoryPort {
  public saved: OfferRuleTree | null = null;

  public async loadRuleTree(): Promise<Result<OfferRuleTree | null, Error>> {
    return Result.ok(this.saved);
  }

  public async saveRuleTree(tree: OfferRuleTree): Promise<Result<void, Error>> {
    this.saved = tree;
    return Result.ok<void, Error>(undefined);
  }
}

describe('SyncOfferRuleTreeUseCase', () => {
  it('builds and saves rule tree from scenarios', async () => {
    const repository = new RuleRepositoryFake();
    const useCase = new SyncOfferRuleTreeUseCase(
      new QueryServiceStub([makeScenario('welcome-new-user', 100)]),
      repository
    );

    const result = await useCase.execute({ appId: 'app-1', version: 'v-test' });

    expect(result.isSuccess()).toBe(true);
    expect(result.data?.ruleTree.appId).toBe('app-1');
    expect(repository.saved?.version).toBe('v-test');
    expect(repository.saved?.scenarios[0].offerIds).toEqual(['welcome-new-user-offer']);
  });
});


