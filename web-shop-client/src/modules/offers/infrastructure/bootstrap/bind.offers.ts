import { Container } from 'inversify';
import { OFFERS_TYPES } from './types';
import { RulesRepository } from '../repositories/rules.repository';
import { OfferRepository } from '../repositories/offer.repository';
import { PropertyReadersService } from '../services/property-readers.service';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { OffersListPresenter } from '../../interface-adapters/presenters/offers-list.presenter';

export function bindOffers(container: Container): void {
  // Repositories
  container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
  container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
  container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
  
  // Use Cases
  container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
  
  // Presenters
  container.bind(OFFERS_TYPES.OffersListPresenter).to(OffersListPresenter).inSingletonScope();
}
