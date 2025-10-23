import { ProductPricingService } from '../services/product-pricing.service';
import { Price } from '../value-objects/price.value-object';

describe('ProductPricingService', () => {
  describe('calculateDiscount', () => {
    it('should calculate 20% discount correctly', () => {
      const originalPrice = new Price(100, 'USD');
      const discountedPrice = ProductPricingService.calculateDiscount(originalPrice, 20);
      expect(discountedPrice.amount).toBe(80);
      expect(discountedPrice.currency).toBe('USD');
    });

    it('should throw error for invalid discount percent', () => {
      const originalPrice = new Price(100, 'USD');
      expect(() => ProductPricingService.calculateDiscount(originalPrice, -5))
        .toThrow('Discount percent must be between 0 and 100');
      expect(() => ProductPricingService.calculateDiscount(originalPrice, 105))
        .toThrow('Discount percent must be between 0 and 100');
    });
  });

  describe('calculateBonusPoints', () => {
    it('should calculate bonus points correctly', () => {
      const price = new Price(100, 'USD');
      const bonus = ProductPricingService.calculateBonusPoints(price, 5);
      expect(bonus).toBe(5);
    });

    it('should throw error for negative bonus', () => {
      const price = new Price(100, 'USD');
      expect(() => ProductPricingService.calculateBonusPoints(price, -5))
        .toThrow('Bonus percent cannot be negative');
    });
  });

  describe('isPriceValid', () => {
    it('should return true for valid price range', () => {
      const price = new Price(50, 'USD');
      const minPrice = new Price(10, 'USD');
      const maxPrice = new Price(100, 'USD');
      
      expect(ProductPricingService.isPriceValid(price, minPrice, maxPrice)).toBe(true);
    });

    it('should return false for price above max', () => {
      const price = new Price(150, 'USD');
      const minPrice = new Price(10, 'USD');
      const maxPrice = new Price(100, 'USD');
      
      expect(ProductPricingService.isPriceValid(price, minPrice, maxPrice)).toBe(false);
    });

    it('should return false for price below min', () => {
      const price = new Price(5, 'USD');
      const minPrice = new Price(10, 'USD');
      const maxPrice = new Price(100, 'USD');
      
      expect(ProductPricingService.isPriceValid(price, minPrice, maxPrice)).toBe(false);
    });

    it('should throw error for different currencies', () => {
      const price = new Price(50, 'USD');
      const minPrice = new Price(10, 'EUR');
      const maxPrice = new Price(100, 'USD');
      
      expect(() => ProductPricingService.isPriceValid(price, minPrice, maxPrice))
        .toThrow('All prices must have the same currency');
    });
  });

  describe('calculateSavings', () => {
    it('should calculate savings correctly', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(80, 'USD');
      const savings = ProductPricingService.calculateSavings(originalPrice, currentPrice);
      
      expect(savings.amount).toBe(20);
      expect(savings.currency).toBe('USD');
    });

    it('should throw error for different currencies', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(80, 'EUR');
      
      expect(() => ProductPricingService.calculateSavings(originalPrice, currentPrice))
        .toThrow('Prices must have the same currency');
    });

    it('should throw error when current price is greater', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(120, 'USD');
      
      expect(() => ProductPricingService.calculateSavings(originalPrice, currentPrice))
        .toThrow('Current price cannot be greater than original price');
    });
  });

  describe('calculateSavingsPercentage', () => {
    it('should calculate savings percentage correctly', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(80, 'USD');
      const percentage = ProductPricingService.calculateSavingsPercentage(originalPrice, currentPrice);
      
      expect(percentage).toBe(20);
    });

    it('should throw error for different currencies', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(80, 'EUR');
      
      expect(() => ProductPricingService.calculateSavingsPercentage(originalPrice, currentPrice))
        .toThrow('Prices must have the same currency');
    });

    it('should throw error for zero original price', () => {
      const originalPrice = new Price(0, 'USD');
      const currentPrice = new Price(80, 'USD');
      
      expect(() => ProductPricingService.calculateSavingsPercentage(originalPrice, currentPrice))
        .toThrow('Original price cannot be zero');
    });
  });

  describe('applyTieredPricing', () => {
    const tiers = [
      { minQuantity: 1, discountPercent: 0 },
      { minQuantity: 5, discountPercent: 10 },
      { minQuantity: 10, discountPercent: 20 }
    ];

    it('should apply no discount for quantity 1', () => {
      const basePrice = new Price(100, 'USD');
      const result = ProductPricingService.applyTieredPricing(basePrice, 1, tiers);
      expect(result.amount).toBe(100);
    });

    it('should apply 10% discount for quantity 5', () => {
      const basePrice = new Price(100, 'USD');
      const result = ProductPricingService.applyTieredPricing(basePrice, 5, tiers);
      expect(result.amount).toBe(90);
    });

    it('should apply 20% discount for quantity 10', () => {
      const basePrice = new Price(100, 'USD');
      const result = ProductPricingService.applyTieredPricing(basePrice, 10, tiers);
      expect(result.amount).toBe(80);
    });

    it('should apply highest tier for quantity 15', () => {
      const basePrice = new Price(100, 'USD');
      const result = ProductPricingService.applyTieredPricing(basePrice, 15, tiers);
      expect(result.amount).toBe(80);
    });

    it('should throw error for zero quantity', () => {
      const basePrice = new Price(100, 'USD');
      expect(() => ProductPricingService.applyTieredPricing(basePrice, 0, tiers))
        .toThrow('Quantity must be greater than zero');
    });
  });

  describe('validatePricingRules', () => {
    it('should return valid for correct pricing', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(80, 'USD');
      const result = ProductPricingService.validatePricingRules(originalPrice, currentPrice, 30);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for different currencies', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(80, 'EUR');
      const result = ProductPricingService.validatePricingRules(originalPrice, currentPrice, 30);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Original and current prices must have the same currency');
    });

    it('should return invalid for current price greater than original', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(120, 'USD');
      const result = ProductPricingService.validatePricingRules(originalPrice, currentPrice, 30);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current price cannot be greater than original price');
    });

    it('should return invalid for excessive discount', () => {
      const originalPrice = new Price(100, 'USD');
      const currentPrice = new Price(50, 'USD'); // 50% discount
      const result = ProductPricingService.validatePricingRules(originalPrice, currentPrice, 30);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount cannot exceed 30%');
    });
  });
});
