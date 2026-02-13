import { describe, it, expect } from 'vitest';
import { Result } from '@/shared/result/result';
import { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type { OfferScenarioQueryServicePort } from '../../application/ports/offer-scenario-query-service.port';
import type { OfferRuleEngineRepositoryPort } from '../../application/ports/offer-rule-engine-repository.port';
import { LoadOfferScenariosUseCase } from '../../application/use-cases/load-offer-scenarios.use-case';

const createScenario = (): OfferScenario => {
  const result = OfferScenario.create({
    id: 'welcome-new-user',
    slug: 'welcome-new-user',
    title: 'Welcome Offer',
    description: 'First session experience for brand new users.',
    categoryCode: 'welcome_retention',
    triggerCode: 'new_user_welcome',
    priority: 100,
    ruleSet: {
      operationType: 'action',
      action: { actionType: 'showOffer', params: { offerId: ['welcome-pack'] } },
    },
    defaultActions: ['discount'],
    configuration: {
      offerIds: ['welcome-pack'],
    },
  });

  if (result.isFailure) {
    throw result.error;
  }

  return result.value!;
};

class QueryServiceStub implements OfferScenarioQueryServicePort {
  public constructor(private readonly scenarios: OfferScenario[]) {}

  public async loadScenarios(): Promise<Result<readonly OfferScenario[], Error>> {
    return Result.ok(this.scenarios);
  }

  public async loadScenario(): Promise<Result<OfferScenario, Error>> {
    return Result.ok(this.scenarios[0]);
  }
}

class RuleRepositoryStub implements OfferRuleEngineRepositoryPort {
  public async loadRuleTree(): Promise<Result<null, Error>> {
    return Result.ok<null, Error>(null);
  }

  public async saveRuleTree(): Promise<Result<void, Error>> {
    return Result.ok<void, Error>(undefined);
  }
}

describe('LoadOfferScenariosUseCase', () => {
  it('returns scenarios without rule tree when not requested', async () => {
    const useCase = new LoadOfferScenariosUseCase(
      new QueryServiceStub([createScenario()]),
      new RuleRepositoryStub()
    );

    const result = await useCase.execute({ appId: 'app-1', includeRuleTree: false });

    expect(result.isSuccess).toBe(true);
    expect(result.value?.scenarios).toHaveLength(1);
    expect(result.value?.ruleTree).toBeNull();
  });
});
















