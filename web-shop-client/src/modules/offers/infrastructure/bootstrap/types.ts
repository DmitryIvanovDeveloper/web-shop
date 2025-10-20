export const OFFERS_TYPES = {
  // Ports
  RulesRepository: Symbol.for('Offers.RulesRepository'),
  OfferRepository: Symbol.for('Offers.OfferRepository'),
  ConditionReader: Symbol.for('Offers.ConditionReader'),
  // Use Cases
  EvaluateOffersUseCase: Symbol.for('Offers.EvaluateOffersUseCase'),
  // Presenters
  OffersListPresenter: Symbol.for('Offers.OffersListPresenter'),
};
