
export class ProductId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Product ID cannot be empty');
    }
    
    if (value.length < 3) {
      throw new Error('Product ID must be at least 3 characters long');
    }
    
    if (value.length > 50) {
      throw new Error('Product ID cannot exceed 50 characters');
    }

        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      throw new Error('Product ID can only contain alphanumeric characters, hyphens, and underscores');
    }

    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  
  static isValid(value: string): boolean {
    try {
      new ProductId(value);
      return true;
    } catch {
      return false;
    }
  }

  
  static generate(prefix: string = 'prod'): ProductId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return new ProductId(`${prefix}-${timestamp}-${random}`);
  }

  
  static fromString(value: string): ProductId {
    return new ProductId(value);
  }

  
  equals(other: ProductId): boolean {
    return this._value === other._value;
  }

  
  toString(): string {
    return this._value;
  }

  
  toDisplayString(): string {
    return this._value.replace(/-/g, ' ').replace(/_/g, ' ');
  }

  
  toUrlSafe(): string {
    return encodeURIComponent(this._value);
  }
}
