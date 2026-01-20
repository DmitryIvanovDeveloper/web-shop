import type { Result } from '../../../../../shared/domain/result/result';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';

export interface OfferScenarioCommandServicePort {
  saveScenario(appId: string, scenario: OfferScenario): Promise<Result<OfferScenario, Error>>;
}

