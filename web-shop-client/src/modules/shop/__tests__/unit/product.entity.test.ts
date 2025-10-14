import { describe, it, expect } from 'vitest';
import { Product } from '../../domain/entities/product.entity';
import { ProductValidationError } from '../../domain/errors/shop.error';

describe('Product Entity', () => {
  it('should create valid product', () => {
    const result = Product.create({
      id: 'prod-001',
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      imageUrl: '/test.png',
      category: 'weapons',
      inStock: true
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.data.name).toBe('Test Product');
  });

  it('should fail with empty name', () => {
    const result = Product.create({
      id: 'prod-001',
      name: '',
      description: 'Test Description',
      price: 100,
      imageUrl: '/test.png',
      category: 'weapons',
      inStock: true
    });

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeInstanceOf(ProductValidationError);
  });

  it('should fail with negative price', () => {
    const result = Product.create({
      id: 'prod-001',
      name: 'Test Product',
      description: 'Test Description',
      price: -100,
      imageUrl: '/test.png',
      category: 'weapons',
      inStock: true
    });

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeInstanceOf(ProductValidationError);
  });
});
