import type { Result } from '@/shared/result/result';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';

export interface OfferScenarioQueryServicePort {
  loadScenarios(appId: string): Promise<Result<readonly OfferScenario[], Error>>;
  loadScenario(appId: string, slug: string): Promise<Result<OfferScenario, Error>>;
}






