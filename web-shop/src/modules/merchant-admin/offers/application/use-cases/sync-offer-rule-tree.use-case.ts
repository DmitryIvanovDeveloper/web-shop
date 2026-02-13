import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';
import { buildOfferRuleTreeFromCatalog } from '../../domain/services';
import type { OfferScenarioQueryServicePort } from '../ports/offer-scenario-query-service.port';
import type { OfferRuleEngineRepositoryPort } from '../ports/offer-rule-engine-repository.port';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';
import type { CatalogScenarioOverride } from '../../domain/services/offer-rule-tree.builder';

export interface SyncOfferRuleTreeInput {
  readonly appId: string;
  readonly version?: string;
}

export interface SyncOfferRuleTreeOutput {
  readonly ruleTree: OfferRuleTree;
}

@injectable()
export class SyncOfferRuleTreeUseCase {
  public constructor(
    @inject(OFFER_TYPES.OfferScenarioQueryService)
    private readonly _queryService: OfferScenarioQueryServicePort,
    @inject(OFFER_TYPES.OfferRuleEngineRepository)
    private readonly _ruleRepository: OfferRuleEngineRepositoryPort
  ) {}

  public async execute(
    input: SyncOfferRuleTreeInput
  ): Promise<Result<SyncOfferRuleTreeOutput, Error>> {
    const scenariosResult = await this._queryService.loadScenarios(input.appId);
    if (scenariosResult.isFailure) {
      return Result.error(scenariosResult.error!);
    }

    const scenarios = scenariosResult.value ?? [];
    const overrides = scenarios.reduce<Record<string, CatalogScenarioOverride>>((acc, scenario) => {
      acc[scenario.slug] = {
        priority: scenario.priority,
        tags: scenario.tags,
        configuration: scenario.configuration.toProps(),
      };
      return acc;
    }, {});

    const ruleTree = buildOfferRuleTreeFromCatalog({
      appId: input.appId,
      version: input.version ?? `v${Date.now()}`,
      overrides,
    });

    const saveResult = await this._ruleRepository.saveRuleTree(ruleTree);
    if (saveResult.isFailure) {
      return Result.error(saveResult.error!);
    }

    return Result.ok({ ruleTree });
  }
}






