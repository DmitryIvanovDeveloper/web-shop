import { describe, it, expect } from 'vitest';
import { Result } from '../../../../shared/domain/result/result';
import { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type { OfferScenarioQueryServicePort } from '../../application/ports/offer-scenario-query-service.port';
import type { OfferScenarioCommandServicePort } from '../../application/ports/offer-scenario-command-service.port';
import { UpdateScenarioConfigUseCase } from '../../application/use-cases/update-scenario-config.use-case';

const buildScenario = (): OfferScenario => {
  const result = OfferScenario.create({
    id: 'vip-offer',
    slug: 'vip-offer',
    title: 'VIP Recognition',
    description: 'Reward high spenders with exclusive bundles.',
    categoryCode: 'purchase_spending',
    triggerCode: 'high_spender',
    priority: 90,
    ruleSet: {
      operationType: 'action',
      action: { actionType: 'showOffer', params: { offerId: ['vip-pack'] } },
    },
    defaultActions: ['discount', 'loyalty_upgrade'],
    configuration: {
      offerIds: ['vip-pack'],
    },
  });

  if (result.isFailure()) {
    throw result.error;
  }

  return result.data!;
};

class QueryServiceFake implements OfferScenarioQueryServicePort {
  public constructor(private scenario: OfferScenario) {}

  public async loadScenarios(): Promise<Result<readonly OfferScenario[], Error>> {
    return Result.ok([this.scenario]);
  }

  public async loadScenario(): Promise<Result<OfferScenario, Error>> {
    return Result.ok(this.scenario);
  }
}

class CommandServiceFake implements OfferScenarioCommandServicePort {
  public async saveScenario(_: string, scenario: OfferScenario): Promise<Result<OfferScenario, Error>> {
    return Result.ok(scenario);
  }
}

describe('UpdateScenarioConfigUseCase', () => {
  it('updates scenario configuration', async () => {
    const useCase = new UpdateScenarioConfigUseCase(
      new QueryServiceFake(buildScenario()),
      new CommandServiceFake()
    );

    const result = await useCase.execute({
      appId: 'app-1',
      slug: 'vip-offer',
      configuration: {
        offerIds: ['vip-pack-2025'],
        bonus: { type: 'currency', amount: 500, unit: 'coins' },
      },
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.data?.scenario.configuration.offerIds).toEqual(['vip-pack-2025']);
    expect(result.data?.scenario.configuration.bonus?.amount).toBe(500);
  });
});


