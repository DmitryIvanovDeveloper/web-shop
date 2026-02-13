export const OFFER_TYPES = {
  OfferScenarioQueryService: Symbol.for('OfferScenarioQueryService'),
  OfferScenarioCommandService: Symbol.for('OfferScenarioCommandService'),
  OfferRuleEngineRepository: Symbol.for('OfferRuleEngineRepository'),
  ProductQueryService: Symbol.for('ProductQueryService'),
  LoadOfferScenariosUseCase: Symbol.for('LoadOfferScenariosUseCase'),
  UpdateScenarioConfigUseCase: Symbol.for('UpdateScenarioConfigUseCase'),
  SyncOfferRuleTreeUseCase: Symbol.for('SyncOfferRuleTreeUseCase'),
  LoadProductsUseCase: Symbol.for('LoadProductsUseCase'),
  OffersPresenter: Symbol.for('OffersPresenter'),
} as const;






