import { Container } from 'inversify';
import { RulesRepository } from '../repositories/rules.repository';
import { OfferRepository } from '../repositories/offer.repository';
import { PropertyReadersService } from '../services/property-readers.service';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { SelectOffersInteractor } from '../../application/use-cases/select-offers.use-case';
import { OffersListPresenter } from '../../interface-adapters/presenters/offers-list.presenter';
import { OffersUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated.handler';
import { OffersAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { OffersLocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { OffersLocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { UIComponentRegistry } from '../../../../infrastructure/services/ui-renderer/component-registry.service';
import { OffersList } from '../../interface-adapters/ui/components/offers-list';
import { OFFERS_TYPES } from './types';

export function bindOffers(container: Container): void {
    container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
  container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
  container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
  
    container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
  container.bind(OFFERS_TYPES.SelectOffersUseCase).to(SelectOffersInteractor).inSingletonScope();
  
    container.bind(OFFERS_TYPES.OffersListPresenter).to(OffersListPresenter).inSingletonScope();
  
    container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(OFFERS_TYPES.UserAuthenticatedHandler)
    .to(OffersUserAuthenticatedHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(OFFERS_TYPES.LocalizationLoadedEventHandler)
    .to(OffersLocalizationLoadedEventHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(OFFERS_TYPES.LocalizationChangedEventHandler)
    .to(OffersLocalizationChangedEventHandler)
    .inTransientScope();

    const uiComponentRegistry = container.get<UIComponentRegistry>(TYPES.UIComponentRegistry);
  uiComponentRegistry.register('OffersList', OffersList);
}
