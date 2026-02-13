export const PRODUCT_TYPES = {
  ProductQueryService: Symbol.for('Products.ProductQueryService'),
  ProductCommandService: Symbol.for('Products.ProductCommandService'),
  ProductImageStorage: Symbol.for('Products.ProductImageStorage'),
  CreateProductUseCase: Symbol.for('Products.CreateProductUseCase'),
  UpdateProductUseCase: Symbol.for('Products.UpdateProductUseCase'),
  DeleteProductUseCase: Symbol.for('Products.DeleteProductUseCase'),
  LoadProductsUseCase: Symbol.for('Products.LoadProductsUseCase'),
  UploadProductImageUseCase: Symbol.for('Products.UploadProductImageUseCase'),
  ProductsPresenter: Symbol.for('Products.ProductsPresenter'),
} as const;






