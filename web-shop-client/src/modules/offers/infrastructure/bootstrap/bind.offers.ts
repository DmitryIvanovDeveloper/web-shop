import { Container } from 'inversify';
import { OFFERS_TYPES } from './types';
import { RulesRepository } from '../repositories/rules.repository';
import { OfferRepository } from '../repositories/offer.repository';
import { PropertyReadersService } from '../services/property-readers.service';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { OffersListPresenter } from '../../interface-adapters/presenters/offers-list.presenter';
import { OffersUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated.handler';
import { OffersAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';

export function bindOffers(container: Container): void {
  // Repositories
  container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
  container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
  container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
  
  // Use Cases
  container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
  
  // Presenters
  container.bind(OFFERS_TYPES.OffersListPresenter).to(OffersListPresenter).inSingletonScope();
  
  // Event Handlers (Interface Adapters) - автоматически подхватываются EventBus
  container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(OFFERS_TYPES.UserAuthenticatedHandler)
    .to(OffersUserAuthenticatedHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'))
    .to(OffersAppConfigLoadedHandler)
    .inTransientScope();
}
