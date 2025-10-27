export const PRODUCTS_TYPES = {
  // Ports
  ProductRepository: Symbol.for('Products.ProductRepository'),
  ProductStorage: Symbol.for('Products.ProductStorage'),
  PurchaseRepository: Symbol.for('Products.PurchaseRepository'),
  PaymentRedirect: Symbol.for('Products.PaymentRedirect'),
  // Use Cases
  LoadProductsUseCase: Symbol.for('Products.LoadProductsUseCase'),
  SelectProductForPaymentUseCase: Symbol.for('Products.SelectProductForPaymentUseCase'),
  GetPurchasedProductsUseCase: Symbol.for('Products.GetPurchasedProductsUseCase'),
  // Services
  ProductStyleService: Symbol.for('Products.ProductStyleService'),
  AuthService: Symbol.for('AuthService'), // Shared с Authentication модулем
  // Presenters
  ProductsListPresenter: Symbol.for('Products.ProductsListPresenter'),
  // Handlers - use generic EventBus symbol for auto-discovery
  ProductsUserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
};

