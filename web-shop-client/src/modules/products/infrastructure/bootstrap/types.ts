export const PRODUCTS_TYPES = {
  // Ports
  ProductRepository: Symbol.for('Products.ProductRepository'),
  // Use Cases
  LoadProductsUseCase: Symbol.for('Products.LoadProductsUseCase'),
  SelectProductForPaymentUseCase: Symbol.for('Products.SelectProductForPaymentUseCase'),
  // Presenters
  ProductsListPresenter: Symbol.for('Products.ProductsListPresenter'),
};

