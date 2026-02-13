import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { OfferScenarioQueryServicePort } from '../../application/ports/offer-scenario-query-service.port';
import type { OfferScenarioCommandServicePort } from '../../application/ports/offer-scenario-command-service.port';
import { buildScenariosFromCatalog } from '../../domain/services';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type {
  ListOfferScenariosResponse,
  OfferScenarioDto,
  UpdateOfferScenarioRequest,
} from '../../application/dtos/offer-scenarios.dto';
import { OfferScenarioConfigurationError } from '../../domain/errors/offer-scenario.error';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';

const API_BASE = '/api/merchant-admin/offers';

const mapDtoToOverride = (dto: OfferScenarioDto) => ({
  priority: dto.priority,
  tags: dto.tags,
  configuration: dto.configuration,
});

const mapScenarioToDto = (scenario: OfferScenario): OfferScenarioDto => ({
  slug: scenario.slug,
  priority: scenario.priority,
  tags: scenario.tags,
  configuration: scenario.configuration.toProps(),
});

@injectable()
export class OfferScenarioApiRepository
  implements OfferScenarioQueryServicePort, OfferScenarioCommandServicePort
{
  public constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient
  ) {}

  public async loadScenarios(appId: string): Promise<Result<readonly OfferScenario[], Error>> {
    try {
      const response = await this._httpClient.get<ListOfferScenariosResponse>(
        `${API_BASE}/scenarios?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        return Result.error(new Error(`Failed to load scenarios (status ${response.status})`));
      }

      const payload = response.data;
      if (!payload || !payload.scenarios) {
        return Result.error(new Error('Invalid response format from API'));
      }

      const overrides = payload.scenarios.reduce<Record<string, ReturnType<typeof mapDtoToOverride>>>(
        (acc, dto) => {
          acc[dto.slug] = mapDtoToOverride(dto);
          return acc;
        },
        {}
      );

      try {
        const scenarios = buildScenariosFromCatalog(overrides);
        return Result.ok(scenarios);
      } catch (error) {
        if (error instanceof OfferScenarioConfigurationError) {
          return Result.error(error as Error);
        }
        return Result.error(error instanceof Error ? error : new Error(String(error)));
      }
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async loadScenario(appId: string, slug: string): Promise<Result<OfferScenario, Error>> {
    const scenariosResult = await this.loadScenarios(appId);
    if (scenariosResult.isFailure) {
      return Result.error(scenariosResult.error!);
    }

    const scenario = scenariosResult.value?.find((item) => item.slug === slug);
    if (!scenario) {
      return Result.error(new Error(`Scenario with slug ${slug} not found`));
    }

    return Result.ok(scenario);
  }

  public async saveScenario(appId: string, scenario: OfferScenario): Promise<Result<OfferScenario, Error>> {
    try {
      const payload: UpdateOfferScenarioRequest = {
        appId,
        scenario: mapScenarioToDto(scenario),
      };

      const response = await this._httpClient.put<{ success: boolean }>(`${API_BASE}/scenarios`, payload);

      if (response.status !== 200) {
        return Result.error(new Error(`Failed to save scenario (status ${response.status})`));
      }

      return Result.ok(scenario);
    } catch (error) {
      return Result.error(error as Error);
    }
  }
}






