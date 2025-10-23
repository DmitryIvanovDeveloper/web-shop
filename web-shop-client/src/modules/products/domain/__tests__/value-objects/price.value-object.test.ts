import { Price } from '../value-objects/price.value-object';

describe('Price Value Object', () => {
  describe('constructor', () => {
    it('should create price with valid amount and currency', () => {
      const price = new Price(29.99, 'USD');
      expect(price.amount).toBe(29.99);
      expect(price.currency).toBe('USD');
    });

    it('should throw error for negative amount', () => {
      expect(() => new Price(-10, 'USD')).toThrow('Price cannot be negative');
    });

    it('should throw error for empty currency', () => {
      expect(() => new Price(10, '')).toThrow('Currency is required');
    });

    it('should round amount to 2 decimal places', () => {
      const price = new Price(29.999, 'USD');
      expect(price.amount).toBe(30.00);
    });

    it('should convert currency to uppercase', () => {
      const price = new Price(10, 'usd');
      expect(price.currency).toBe('USD');
    });
  });

  describe('format', () => {
    it('should format USD price correctly', () => {
      const price = new Price(29.99, 'USD');
      expect(price.format()).toBe('$29.99');
    });

    it('should format EUR price correctly', () => {
      const price = new Price(25.50, 'EUR');
      expect(price.format()).toBe('€25.50');
    });

    it('should format amount without symbol', () => {
      const price = new Price(29.99, 'USD');
      expect(price.formatAmount()).toBe('29.99');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      const originalPrice = new Price(100, 'USD');
      const discountedPrice = originalPrice.calculateDiscount(10);
      expect(discountedPrice.amount).toBe(90);
      expect(discountedPrice.currency).toBe('USD');
    });

    it('should throw error for invalid discount percent', () => {
      const price = new Price(100, 'USD');
      expect(() => price.calculateDiscount(-5)).toThrow('Discount percent must be between 0 and 100');
      expect(() => price.calculateDiscount(105)).toThrow('Discount percent must be between 0 and 100');
    });
  });

  describe('addBonus', () => {
    it('should calculate bonus points correctly', () => {
      const price = new Price(100, 'USD');
      const bonus = price.addBonus(5);
      expect(bonus).toBe(5);
    });

    it('should throw error for negative bonus', () => {
      const price = new Price(100, 'USD');
      expect(() => price.addBonus(-5)).toThrow('Bonus percent cannot be negative');
    });
  });

  describe('equals', () => {
    it('should return true for equal prices', () => {
      const price1 = new Price(29.99, 'USD');
      const price2 = new Price(29.99, 'USD');
      expect(price1.equals(price2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const price1 = new Price(29.99, 'USD');
      const price2 = new Price(39.99, 'USD');
      expect(price1.equals(price2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const price1 = new Price(29.99, 'USD');
      const price2 = new Price(29.99, 'EUR');
      expect(price1.equals(price2)).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when amount is greater', () => {
      const price1 = new Price(50, 'USD');
      const price2 = new Price(30, 'USD');
      expect(price1.isGreaterThan(price2)).toBe(true);
    });

    it('should return false when amount is not greater', () => {
      const price1 = new Price(30, 'USD');
      const price2 = new Price(50, 'USD');
      expect(price1.isGreaterThan(price2)).toBe(false);
    });

    it('should throw error for different currencies', () => {
      const price1 = new Price(50, 'USD');
      const price2 = new Price(30, 'EUR');
      expect(() => price1.isGreaterThan(price2)).toThrow('Cannot compare prices with different currencies');
    });
  });

  describe('fromString', () => {
    it('should parse price string correctly', () => {
      const price = Price.fromString('$29.99', 'USD');
      expect(price.amount).toBe(29.99);
      expect(price.currency).toBe('USD');
    });

    it('should parse price without currency symbol', () => {
      const price = Price.fromString('29.99', 'USD');
      expect(price.amount).toBe(29.99);
    });

    it('should throw error for invalid format', () => {
      expect(() => Price.fromString('invalid', 'USD')).toThrow('Invalid price format: invalid');
    });

    it('should throw error for empty string', () => {
      expect(() => Price.fromString('', 'USD')).toThrow('Price string cannot be empty');
    });
  });

  describe('zero', () => {
    it('should create zero price', () => {
      const price = Price.zero('USD');
      expect(price.amount).toBe(0);
      expect(price.currency).toBe('USD');
    });
  });
});
