
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
    
    this._amount = Math.round(amount * 100) / 100;     this._currency = currency.toUpperCase();
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  
  format(): string {
    const symbol = this._getCurrencySymbol();
    return `${symbol}${this._amount.toFixed(2)}`;
  }

  
  formatAmount(): string {
    return this._amount.toFixed(2);
  }

  
  calculateDiscount(discountPercent: number): Price {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percent must be between 0 and 100');
    }
    
    const discountAmount = this._amount * (discountPercent / 100);
    return new Price(this._amount - discountAmount, this._currency);
  }

  
  addBonus(bonusPercent: number): number {
    if (bonusPercent < 0) {
      throw new Error('Bonus percent cannot be negative');
    }
    return Math.round(this._amount * (bonusPercent / 100));
  }

  
  equals(other: Price): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  
  isGreaterThan(other: Price): boolean {
    if (this._currency !== other._currency) {
      throw new Error('Cannot compare prices with different currencies');
    }
    return this._amount > other._amount;
  }

  
  private _getCurrencySymbol(): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };
    return symbols[this._currency] || this._currency;
  }

  
  static fromString(priceString: string, currency: string = 'USD'): Price {
    if (!priceString || priceString.trim() === '') {
      throw new Error('Price string cannot be empty');
    }

        const cleanString = priceString.replace(/[^\d.,]/g, '');
    const amount = parseFloat(cleanString.replace(',', '.'));
    
    if (isNaN(amount)) {
      throw new Error(`Invalid price format: ${priceString}`);
    }

    return new Price(amount, currency);
  }

  
  static zero(currency: string = 'USD'): Price {
    return new Price(0, currency);
  }
}
