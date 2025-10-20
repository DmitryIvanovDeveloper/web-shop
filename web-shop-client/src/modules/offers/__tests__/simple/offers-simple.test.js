// Simple test for offers module without complex setup
const { describe, it, expect } = require('vitest');

describe('Offers Module - Simple Tests', () => {
  it('should have basic structure', () => {
    // Test that we can import the module
    const EvaluateOffersUseCase = require('../../application/use-cases/evaluate-offers.use-case');
    expect(EvaluateOffersUseCase).toBeDefined();
  });

  it('should have rules repository', () => {
    const RulesRepository = require('../../infrastructure/repositories/rules.repository');
    expect(RulesRepository).toBeDefined();
  });

  it('should have offer repository', () => {
    const OfferRepository = require('../../infrastructure/repositories/offer.repository');
    expect(OfferRepository).toBeDefined();
  });

  it('should have property readers service', () => {
    const PropertyReadersService = require('../../infrastructure/services/property-readers.service');
    expect(PropertyReadersService).toBeDefined();
  });
});
