/**
 * Price Value Object
 * 
 * Immutable value object representing a monetary amount
 * Encapsulates price formatting and validation logic
 */
export class Price {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = 'USD') {
    if (amount < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!currency || currency.trim() === '') {
      throw new Error('Currency is required');
    }
    
    this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this._currency = currency.toUpperCase();
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  /**
   * Format price for display
   */
  format(): string {
    const symbol = this._getCurrencySymbol();
    return `${symbol}${this._amount.toFixed(2)}`;
  }

  /**
   * Format price without currency symbol
   */
  formatAmount(): string {
    return this._amount.toFixed(2);
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(discountPercent: number): Price {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percent must be between 0 and 100');
    }
    
    const discountAmount = this._amount * (discountPercent / 100);
    return new Price(this._amount - discountAmount, this._currency);
  }

  /**
   * Add bonus points
   */
  addBonus(bonusPercent: number): number {
    if (bonusPercent < 0) {
      throw new Error('Bonus percent cannot be negative');
    }
    return Math.round(this._amount * (bonusPercent / 100));
  }

  /**
   * Compare with another price
   */
  equals(other: Price): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   * Check if price is greater than another
   */
  isGreaterThan(other: Price): boolean {
    if (this._currency !== other._currency) {
      throw new Error('Cannot compare prices with different currencies');
    }
    return this._amount > other._amount;
  }

  /**
   * Get currency symbol
   */
  private _getCurrencySymbol(): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };
    return symbols[this._currency] || this._currency;
  }

  /**
   * Create from string (e.g., "$29.99")
   */
  static fromString(priceString: string, currency: string = 'USD'): Price {
    if (!priceString || priceString.trim() === '') {
      throw new Error('Price string cannot be empty');
    }

    // Remove currency symbols and parse
    const cleanString = priceString.replace(/[^\d.,]/g, '');
    const amount = parseFloat(cleanString.replace(',', '.'));
    
    if (isNaN(amount)) {
      throw new Error(`Invalid price format: ${priceString}`);
    }

    return new Price(amount, currency);
  }

  /**
   * Create zero price
   */
  static zero(currency: string = 'USD'): Price {
    return new Price(0, currency);
  }
}
