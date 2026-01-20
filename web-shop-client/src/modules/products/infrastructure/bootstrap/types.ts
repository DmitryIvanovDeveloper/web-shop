export const  PRODUCTS_TYPES = {
    ProductRepository: Symbol.for('Products.ProductRepository'),
  ProductStorage: Symbol.for('Products.ProductStorage'),
  PurchaseRepository: Symbol.for('Products.PurchaseRepository'),
  PaymentRedirect: Symbol.for('Products.PaymentRedirect'),
    LoadProductsUseCase: Symbol.for('Products.LoadProductsUseCase'),
  SelectProductForPaymentUseCase: Symbol.for('Products.SelectProductForPaymentUseCase'),
  GetPurchasedProductsUseCase: Symbol.for('Products.GetPurchasedProductsUseCase'),
    ProductStyleService: Symbol.for('Products.ProductStyleService'),
  AuthService: Symbol.for('AuthService'),     ProductsListPresenter: Symbol.for('Products.ProductsListPresenter'),
    AppConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'),
  TranslationsConfigEventHandler: Symbol.for('IAsyncEventHandler<TranslationsConfigEvent>'),
  ProductsUserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
  LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>'),
};


