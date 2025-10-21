import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { RulesRepository } from '../../infrastructure/repositories/rules.repository';
import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';

describe('EvaluateOffersUseCase', () => {
  let useCase: EvaluateOffersUseCase;
  let mockRulesRepository: RulesRepository;
  let mockOfferRepository: OfferRepository;
  let mockPropertyReadersService: PropertyReadersService;

  beforeEach(() => {
    // Create mocks
    mockRulesRepository = {
      getRules: vi.fn()
    } as any;

    mockOfferRepository = {
      getById: vi.fn()
    } as any;

    mockPropertyReadersService = {
      readProperty: vi.fn()
    } as any;

    // Create use case with mocked dependencies
    useCase = new EvaluateOffersUseCase(
      mockRulesRepository,
      mockOfferRepository,
      mockPropertyReadersService
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return empty array when no rules', async () => {
    (mockRulesRepository.getRules as any).mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result).toEqual([]);
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
        action: { actionType: 'showOffer', params: { offerId: ['test-offer'] } }
      }
    };

    (mockRulesRepository.getRules as any).mockResolvedValue(mockRules);
    (mockPropertyReadersService.readProperty as any).mockResolvedValue(2); // user has 2 purchases, needs 10

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('should return offers when condition is met', async () => {
    const mockRules = {
      operationType: 'condition',
      condition: {
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.purchases.length' },
        value2: { type: 'value', value: 1 }
      },
      nextOperation: {
        operationType: 'action',
        action: { actionType: 'showOffer', params: { offerId: ['test-offer'] } }
      }
    };

    const mockOffer = {
      id: 'test-offer',
      title: 'Test Offer',
      currentPrice: '$10.00'
    };

    (mockRulesRepository.getRules as any).mockResolvedValue(mockRules);
    (mockPropertyReadersService.readProperty as any).mockResolvedValue(2); // user has 2 purchases, needs 1
    (mockOfferRepository.getById as any).mockResolvedValue(mockOffer);

    const result = await useCase.execute();

    expect(result).toEqual([mockOffer]);
  });
});

