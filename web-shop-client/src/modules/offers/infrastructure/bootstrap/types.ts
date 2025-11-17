export const OFFERS_TYPES = {
  // Ports
  RulesRepository: Symbol.for('Offers.RulesRepository'),
  OfferRepository: Symbol.for('Offers.OfferRepository'),
  ConditionReader: Symbol.for('Offers.ConditionReader'),
  // Use Cases
  EvaluateOffersUseCase: Symbol.for('Offers.EvaluateOffersUseCase'),
  SelectOffersUseCase: Symbol.for('Offers.SelectOffersUseCase'),
  // Presenters
  OffersListPresenter: Symbol.for('Offers.OffersListPresenter'),
  // Handlers
  UserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>')
};
