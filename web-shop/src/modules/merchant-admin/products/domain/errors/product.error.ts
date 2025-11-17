export class ProductNotFoundError extends Error {
  constructor(message: string = 'Product not found') {
    super(message);
    this.name = 'ProductNotFoundError';
  }
}

export class InvalidProductError extends Error {
  constructor(message: string = 'Invalid product data') {
    super(message);
    this.name = 'InvalidProductError';
  }
}

export class ProductValidationError extends Error {
  constructor(message: string = 'Product validation failed') {
    super(message);
    this.name = 'ProductValidationError';
  }
}

