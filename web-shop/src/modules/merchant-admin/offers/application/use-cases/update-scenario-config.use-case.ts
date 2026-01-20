import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type { OfferScenarioConfigurationProps } from '../../domain/entities/offer-scenario-configuration.entity';
import type { OfferScenarioQueryServicePort } from '../ports/offer-scenario-query-service.port';
import type { OfferScenarioCommandServicePort } from '../ports/offer-scenario-command-service.port';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';

export interface UpdateScenarioConfigInput {
  readonly appId: string;
  readonly slug: string;
  readonly configuration: OfferScenarioConfigurationProps;
}

export interface UpdateScenarioConfigOutput {
  readonly scenario: OfferScenario;
}

@injectable()
export class UpdateScenarioConfigUseCase {
  public constructor(
    @inject(OFFER_TYPES.OfferScenarioQueryService)
    private readonly _queryService: OfferScenarioQueryServicePort,
    @inject(OFFER_TYPES.OfferScenarioCommandService)
    private readonly _commandService: OfferScenarioCommandServicePort
  ) {}

  public async execute(
    input: UpdateScenarioConfigInput
  ): Promise<Result<UpdateScenarioConfigOutput, Error>> {
    const scenarioResult = await this._queryService.loadScenario(input.appId, input.slug);
    if (scenarioResult.isFailure()) {
      return Result.error(scenarioResult.error!);
    }

    const updatedScenarioResult = scenarioResult.data!.withConfiguration(input.configuration);
    if (updatedScenarioResult.isFailure()) {
      return Result.error(updatedScenarioResult.error);
    }

    const saveResult = await this._commandService.saveScenario(input.appId, updatedScenarioResult.data!);
    if (saveResult.isFailure()) {
      return Result.error(saveResult.error!);
    }

    return Result.ok({ scenario: saveResult.data! });
  }
}

