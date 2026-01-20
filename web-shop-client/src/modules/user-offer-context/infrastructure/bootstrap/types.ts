export const USER_OFFER_CONTEXT_TYPES = {
  ContextReader: Symbol.for('UserOfferContext.ContextReader'),
  ContextWriter: Symbol.for('UserOfferContext.ContextWriter'),
    HandleUserRegisteredUseCase: Symbol.for('UserOfferContext.HandleUserRegisteredUseCase'),
  HandleUserReturnedUseCase: Symbol.for('UserOfferContext.HandleUserReturnedUseCase'),
  HandleFirstPaymentCompletedUseCase: Symbol.for('UserOfferContext.HandleFirstPaymentCompletedUseCase'),
  HandleMbcLinkStatusChangedUseCase: Symbol.for('UserOfferContext.HandleMbcLinkStatusChangedUseCase'),
  HandlePurchaseRecordedUseCase: Symbol.for('UserOfferContext.HandlePurchaseRecordedUseCase'),
  HandleWeeklyPurchaseMetricsCalculatedUseCase: Symbol.for(
    'UserOfferContext.HandleWeeklyPurchaseMetricsCalculatedUseCase'
  ),
  HandleLifetimeSpendMilestoneReachedUseCase: Symbol.for(
    'UserOfferContext.HandleLifetimeSpendMilestoneReachedUseCase'
  ),
  HandleUserActivitySnapshotUseCase: Symbol.for('UserOfferContext.HandleUserActivitySnapshotUseCase'),
  HandleProductViewRecordedUseCase: Symbol.for('UserOfferContext.HandleProductViewRecordedUseCase'),
  HandleCategoryIntentDetectedUseCase: Symbol.for('UserOfferContext.HandleCategoryIntentDetectedUseCase'),
  HandleCartStatusChangedUseCase: Symbol.for('UserOfferContext.HandleCartStatusChangedUseCase'),
  HandleWeekendPurchaseWindowUpdatedUseCase: Symbol.for(
    'UserOfferContext.HandleWeekendPurchaseWindowUpdatedUseCase'
  ),
  HandleUserGeoSegmentResolvedUseCase: Symbol.for('UserOfferContext.HandleUserGeoSegmentResolvedUseCase'),
  HandleSubscriptionStatusChangedUseCase: Symbol.for('UserOfferContext.HandleSubscriptionStatusChangedUseCase'),
  HandleSubscriptionPlanChangedUseCase: Symbol.for('UserOfferContext.HandleSubscriptionPlanChangedUseCase'),
    UserOfferContextEventHandler: Symbol.for('UserOfferContext.EventHandler'),
  UserOfferContextAuthenticatedHandler: Symbol.for('UserOfferContext.AuthenticatedEventHandler'),
  UserAuthenticatedEventHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
} as const;











