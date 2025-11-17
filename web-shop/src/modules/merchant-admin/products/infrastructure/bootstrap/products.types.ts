export const PRODUCT_TYPES = {
  ProductQueryService: Symbol.for('Products.ProductQueryService'),
  ProductCommandService: Symbol.for('Products.ProductCommandService'),
  CreateProductUseCase: Symbol.for('Products.CreateProductUseCase'),
  UpdateProductUseCase: Symbol.for('Products.UpdateProductUseCase'),
  DeleteProductUseCase: Symbol.for('Products.DeleteProductUseCase'),
  LoadProductsUseCase: Symbol.for('Products.LoadProductsUseCase'),
  ProductsPresenter: Symbol.for('Products.ProductsPresenter'),
} as const;

