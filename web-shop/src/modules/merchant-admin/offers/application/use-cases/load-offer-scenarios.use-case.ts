import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';
import type { OfferScenarioQueryServicePort } from '../ports/offer-scenario-query-service.port';
import type { OfferRuleEngineRepositoryPort } from '../ports/offer-rule-engine-repository.port';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';

export interface LoadOfferScenariosInput {
  readonly appId: string;
  readonly includeRuleTree?: boolean;
}

export interface LoadOfferScenariosOutput {
  readonly scenarios: readonly OfferScenario[];
  readonly ruleTree: OfferRuleTree | null;
}

@injectable()
export class LoadOfferScenariosUseCase {
  public constructor(
    @inject(OFFER_TYPES.OfferScenarioQueryService)
    private readonly queryService: OfferScenarioQueryServicePort,
    @inject(OFFER_TYPES.OfferRuleEngineRepository)
    private readonly ruleRepository: OfferRuleEngineRepositoryPort
  ) {}

  public async execute(
    input: LoadOfferScenariosInput
  ): Promise<Result<LoadOfferScenariosOutput, Error>> {
    const scenariosResult = await this.queryService.loadScenarios(input.appId);
    if (scenariosResult.isFailure()) {
      return Result.error(scenariosResult.error!);
    }

    let ruleTree: OfferRuleTree | null = null;

    if (input.includeRuleTree) {
      const ruleTreeResult = await this.ruleRepository.loadRuleTree(input.appId);
      if (ruleTreeResult.isFailure()) {
        return Result.error(ruleTreeResult.error!);
      }
      ruleTree = ruleTreeResult.data ?? null;
    }

    return Result.ok({
      scenarios: scenariosResult.data ?? [],
      ruleTree,
    });
  }
}


