import { Container } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import { PersonalOffersPresenter } from '../../interface-adapters/presenters/personal-offers.presenter';
import { PersonalOffersUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated-event.handler';
import { PERSONAL_OFFERS_TYPES } from './types';

export function bindPersonalOffers(container: Container): void {
  container.bind(PERSONAL_OFFERS_TYPES.Presenter).to(PersonalOffersPresenter).inSingletonScope();

  container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(PERSONAL_OFFERS_TYPES.UserAuthenticatedHandler)
    .to(PersonalOffersUserAuthenticatedHandler)
    .inTransientScope();
}


