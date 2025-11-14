import { Container } from 'inversify';
import { OFFER_TYPES } from './offers.types';
import { OfferScenarioApiRepository } from '../repositories/offer-scenario-api.repository';
import { OfferRuleEngineApiRepository } from '../repositories/offer-rule-engine-api.repository';
import { ProductSupabaseRepository } from '../repositories/product-supabase.repository';
import {
  LoadOfferScenariosUseCase,
  SyncOfferRuleTreeUseCase,
  UpdateScenarioConfigUseCase,
  LoadProductsUseCase,
} from '../../application/use-cases';
import { OffersPresenter } from '../../interface-adapters/presenters/offers.presenter';
import type { OfferScenarioQueryServicePort } from '../../application/ports/offer-scenario-query-service.port';
import type { OfferScenarioCommandServicePort } from '../../application/ports/offer-scenario-command-service.port';
import type { OfferRuleEngineRepositoryPort } from '../../application/ports/offer-rule-engine-repository.port';
import type { ProductQueryServicePort } from '../../application/ports/product-query-service.port';

export function bindMerchantAdminOffers(container: Container): void {
  container.bind(OfferScenarioApiRepository).toSelf().inSingletonScope();

  container
    .bind<OfferScenarioQueryServicePort>(OFFER_TYPES.OfferScenarioQueryService)
    .toService(OfferScenarioApiRepository);

  container
    .bind<OfferScenarioCommandServicePort>(OFFER_TYPES.OfferScenarioCommandService)
    .toService(OfferScenarioApiRepository);

  container
    .bind<OfferRuleEngineRepositoryPort>(OFFER_TYPES.OfferRuleEngineRepository)
    .to(OfferRuleEngineApiRepository)
    .inSingletonScope();

  container.bind(ProductSupabaseRepository).toSelf().inSingletonScope();

  container
    .bind<ProductQueryServicePort>(OFFER_TYPES.ProductQueryService)
    .toService(ProductSupabaseRepository);

  container
    .bind<LoadOfferScenariosUseCase>(OFFER_TYPES.LoadOfferScenariosUseCase)
    .to(LoadOfferScenariosUseCase)
    .inSingletonScope();

  container
    .bind<LoadProductsUseCase>(OFFER_TYPES.LoadProductsUseCase)
    .to(LoadProductsUseCase)
    .inSingletonScope();

  container
    .bind<UpdateScenarioConfigUseCase>(OFFER_TYPES.UpdateScenarioConfigUseCase)
    .to(UpdateScenarioConfigUseCase)
    .inSingletonScope();

  container
    .bind<SyncOfferRuleTreeUseCase>(OFFER_TYPES.SyncOfferRuleTreeUseCase)
    .to(SyncOfferRuleTreeUseCase)
    .inSingletonScope();

  container.bind(OffersPresenter).toSelf().inSingletonScope();
  container.bind(OFFER_TYPES.OffersPresenter).toService(OffersPresenter);
}
