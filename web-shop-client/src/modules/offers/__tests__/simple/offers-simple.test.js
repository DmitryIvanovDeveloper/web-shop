// Simple test for offers module without complex setup
import { describe, it, expect } from 'vitest';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { RulesRepository } from '../../infrastructure/repositories/rules.repository';
import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';

describe('Offers Module - Simple Tests', () => {
  it('should have basic structure', () => {
    // Test that we can import the module
    expect(EvaluateOffersUseCase).toBeDefined();
  });

  it('should have rules repository', () => {
    expect(RulesRepository).toBeDefined();
  });

  it('should have offer repository', () => {
    expect(OfferRepository).toBeDefined();
  });

  it('should have property readers service', () => {
    expect(PropertyReadersService).toBeDefined();
  });
});

