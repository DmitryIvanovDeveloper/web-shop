/**
 * ProductId Value Object
 * 
 * Immutable value object representing a product identifier
 * Encapsulates ID validation and formatting logic
 */
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

    // Allow alphanumeric characters, hyphens, and underscores
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      throw new Error('Product ID can only contain alphanumeric characters, hyphens, and underscores');
    }

    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  /**
   * Check if ID is valid format
   */
  static isValid(value: string): boolean {
    try {
      new ProductId(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a new product ID
   */
  static generate(prefix: string = 'prod'): ProductId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return new ProductId(`${prefix}-${timestamp}-${random}`);
  }

  /**
   * Create from existing string (with validation)
   */
  static fromString(value: string): ProductId {
    return new ProductId(value);
  }

  /**
   * Check equality with another ProductId
   */
  equals(other: ProductId): boolean {
    return this._value === other._value;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Get display format (formatted)
   */
  toDisplayString(): string {
    return this._value.replace(/-/g, ' ').replace(/_/g, ' ');
  }

  /**
   * Get URL-safe format
   */
  toUrlSafe(): string {
    return encodeURIComponent(this._value);
  }
}
