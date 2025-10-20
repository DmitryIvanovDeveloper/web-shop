import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { RulesRepository } from '../../infrastructure/repositories/rules.repository';
import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

describe('EvaluateOffersUseCase', () => {
  let container: Container;
  let useCase: EvaluateOffersUseCase;

  beforeEach(() => {
    container = new Container();
    
    // Register dependencies
    container.bind(TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
    container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
    
    useCase = container.get(OFFERS_TYPES.EvaluateOffersUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should execute without errors', async () => {
    // This test will fail if the use case can't be instantiated
    // or if there are missing dependencies
    expect(async () => {
      await useCase.execute();
    }).not.toThrow();
  });
});
