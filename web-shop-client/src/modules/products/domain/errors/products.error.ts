export class ProductsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ProductsError';
  }
}

export class ProductNotFoundError extends ProductsError {
  constructor(productId: string) {
    super(`Product with id "${productId}" not found`, 'PRODUCT_NOT_FOUND');
  }
}

export class ProductsLoadError extends ProductsError {
  constructor(originalError?: Error) {
    super('Failed to load products', 'PRODUCTS_LOAD_ERROR', originalError);
  }
}

