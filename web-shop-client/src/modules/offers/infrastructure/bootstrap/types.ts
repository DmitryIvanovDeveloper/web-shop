export const OFFERS_TYPES = {
    RulesRepository: Symbol.for('Offers.RulesRepository'),
  OfferRepository: Symbol.for('Offers.OfferRepository'),
  ConditionReader: Symbol.for('Offers.ConditionReader'),
    EvaluateOffersUseCase: Symbol.for('Offers.EvaluateOffersUseCase'),
  SelectOffersUseCase: Symbol.for('Offers.SelectOffersUseCase'),
    OffersListPresenter: Symbol.for('Offers.OffersListPresenter'),
    UserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
  LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>')
};
