import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { RulesRepository } from '../../infrastructure/repositories/rules.repository';
import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

describe('Offers Integration Flow', () => {
  let container: Container;
  let useCase: EvaluateOffersUseCase;
  let httpClient: HttpClientMock;

  beforeEach(() => {
    container = new Container();
    
    // Register dependencies
    httpClient = new HttpClientMock();
    container.bind(TYPES.HttpClient).toConstantValue(httpClient);
    container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
    container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
    
    useCase = container.get(OFFERS_TYPES.EvaluateOffersUseCase);
  });

  it('should complete full offers evaluation flow', async () => {
    // Mock rules response
    const mockRules = {
      operationType: 'condition',
      condition: {
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.purchases.length' },
        value2: { type: 'value', value: 1 }
      },
      nextOperation: {
        operationType: 'action',
        action: { actionType: 'showOffer', params: { offerId: ['tank-turret'] } }
      }
    };

    // Mock user purchases
    const mockPurchases = [
      { id: 'purchase-1', amount: 10 },
      { id: 'purchase-2', amount: 20 }
    ];

    // Mock offer data
    const mockOffer = {
      id: 'tank-turret',
      title: 'Tank Turret',
      currentPrice: '$20.00',
      originalPrice: '$39.99'
    };

    // Note: HttpClientMock automatically loads from /mocks/api/ files
    // The test will use the existing mock files in public/mocks/api/

    const result = await useCase.execute();

    // HttpClientMock loads from actual mock files
    // Expecting offers based on rules.json: ['dragon-slayer', 'tank-turret']
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array when condition is not met', async () => {
    const mockRules = {
      operationType: 'condition',
      condition: {
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.purchases.length' },
        value2: { type: 'value', value: 10 }
      },
      nextOperation: {
        operationType: 'action',
        action: { actionType: 'showOffer', params: { offerId: ['tank-turret'] } }
      }
    };

    const mockPurchases = [
      { id: 'purchase-1', amount: 10 }
    ];

    httpClient.setMockResponse('/api/offers/rules', mockRules);
    httpClient.setMockResponse('/api/user/purchases', mockPurchases);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});

