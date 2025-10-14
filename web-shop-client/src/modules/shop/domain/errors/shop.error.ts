export class ShopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShopError';
  }
}

export class ProductValidationError extends ShopError {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class ProductNotFoundError extends ShopError {
  constructor(productId: string) {
    super(`Product with id ${productId} not found`);
    this.name = 'ProductNotFoundError';
  }
}
