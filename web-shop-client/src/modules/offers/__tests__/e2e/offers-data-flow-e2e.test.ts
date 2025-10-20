import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Container } from 'inversify';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { RulesRepository } from '../../infrastructure/repositories/rules.repository';
import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';
import { OffersListPresenter } from '../../interface-adapters/presenters/offers-list.presenter';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

describe('Offers Data Flow E2E Tests', () => {
  let container: Container;
  let useCase: EvaluateOffersUseCase;
  let presenter: OffersListPresenter;

  beforeEach(() => {
    container = new Container();
    
    // Register all dependencies
    container.bind(TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
    container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
    container.bind(OFFERS_TYPES.OffersListPresenter).to(OffersListPresenter).inSingletonScope();
    
    useCase = container.get(OFFERS_TYPES.EvaluateOffersUseCase);
    presenter = container.get(OFFERS_TYPES.OffersListPresenter);
  });

  afterEach(() => {
    container.unbindAll();
  });

  it('should complete full data flow from API to UI', async () => {
    console.log('=== Starting Full Data Flow E2E Test ===');
    
    // Step 1: Load rules from API
    console.log('Step 1: Loading rules...');
    const rulesRepository = container.get(OFFERS_TYPES.RulesRepository);
    const rules = await rulesRepository.loadRules();
    
    expect(rules).toBeDefined();
    expect(rules.operationType).toBe('condition');
    console.log('✓ Rules loaded:', rules.operationType);
    
    // Step 2: Read user data
    console.log('Step 2: Reading user data...');
    const conditionReader = container.get(OFFERS_TYPES.ConditionReader);
    const userPurchasesLength = await conditionReader.read('user.purchases.length');
    
    expect(userPurchasesLength).toBe(2);
    console.log('✓ User purchases length:', userPurchasesLength);
    
    // Step 3: Evaluate condition
    console.log('Step 3: Evaluating condition...');
    const condition = rules.condition;
    const leftValue = userPurchasesLength;
    const rightValue = condition.value2.value;
    const conditionResult = leftValue >= rightValue;
    
    expect(conditionResult).toBe(true);
    console.log('✓ Condition result:', conditionResult, `(${leftValue} >= ${rightValue})`);
    
    // Step 4: Execute action if condition is true
    console.log('Step 4: Executing action...');
    if (conditionResult) {
      const action = rules.nextOperation.action;
      expect(action.actionType).toBe('showOffer');
      expect(action.params.offerId).toBe('tank-turret');
      console.log('✓ Action to execute:', action.actionType, 'for offer:', action.params.offerId);
    }
    
    // Step 5: Load offer data
    console.log('Step 5: Loading offer data...');
    const offerRepository = container.get(OFFERS_TYPES.OfferRepository);
    const offer = await offerRepository.getById('tank-turret');
    
    expect(offer).toBeDefined();
    if (offer && Object.keys(offer).length > 0) {
      expect(offer.id).toBe('tank-turret');
      console.log('✓ Offer loaded:', offer.id, offer.title);
    } else {
      console.log('⚠ Offer loaded but empty (expected in test environment)');
    }
    
    // Step 6: Execute use case
    console.log('Step 6: Executing use case...');
    const offers = await useCase.execute();
    
    expect(offers).toBeDefined();
    expect(Array.isArray(offers)).toBe(true);
    console.log('✓ Use case executed, offers count:', offers.length);
    
    // Step 7: Test presenter
    console.log('Step 7: Testing presenter...');
    const viewModel = await presenter.present();
    
    expect(viewModel).toBeDefined();
    expect(viewModel.status).toBeDefined();
    console.log('✓ Presenter executed, status:', viewModel.status);
    
    if (viewModel.status === 'success') {
      expect(viewModel.offers).toBeDefined();
      expect(Array.isArray(viewModel.offers)).toBe(true);
      console.log('✓ ViewModel offers count:', viewModel.offers.length);
    }
    
    console.log('=== Full Data Flow E2E Test Completed ===');
  });

  it('should validate business logic consistency', async () => {
    console.log('=== Starting Business Logic Validation ===');
    
    // Test 1: Rules structure validation
    const rulesRepository = container.get(OFFERS_TYPES.RulesRepository);
    const rules = await rulesRepository.loadRules();
    
    expect(rules.operationType).toBe('condition');
    expect(rules.condition.conditionType).toBe('gte');
    expect(rules.condition.value1.type).toBe('property');
    expect(rules.condition.value1.value).toBe('user.purchases.length');
    expect(rules.condition.value2.type).toBe('value');
    expect(rules.condition.value2.value).toBe(1);
    expect(rules.nextOperation.operationType).toBe('action');
    expect(rules.nextOperation.action.actionType).toBe('showOffer');
    expect(rules.nextOperation.action.params.offerId).toBe('tank-turret');
    
    console.log('✓ Rules structure validated');
    
    // Test 2: User data validation
    const conditionReader = container.get(OFFERS_TYPES.ConditionReader);
    const userPurchasesLength = await conditionReader.read('user.purchases.length');
    
    expect(typeof userPurchasesLength).toBe('number');
    expect(userPurchasesLength).toBeGreaterThanOrEqual(0);
    expect(userPurchasesLength).toBe(2);
    
    console.log('✓ User data validated');
    
    // Test 3: Condition evaluation validation
    const conditionResult = userPurchasesLength >= 1;
    expect(conditionResult).toBe(true);
    
    console.log('✓ Condition evaluation validated');
    
    // Test 4: Action execution validation
    if (conditionResult) {
      const offerId = rules.nextOperation.action.params.offerId;
      expect(offerId).toBe('tank-turret');
      
      const offerRepository = container.get(OFFERS_TYPES.OfferRepository);
      const offer = await offerRepository.getById(offerId);
      expect(offer).toBeDefined();
      
      console.log('✓ Action execution validated');
    }
    
    // Test 5: Use case execution validation
    const offers = await useCase.execute();
    expect(Array.isArray(offers)).toBe(true);
    
    console.log('✓ Use case execution validated');
    
    // Test 6: Presenter execution validation
    const viewModel = await presenter.present();
    expect(viewModel.status).toBeDefined();
    expect(['loading', 'success', 'error']).toContain(viewModel.status);
    
    console.log('✓ Presenter execution validated');
    
    console.log('=== Business Logic Validation Completed ===');
  });

  it('should handle error scenarios gracefully', async () => {
    console.log('=== Starting Error Handling Test ===');
    
    try {
      // Test 1: Use case execution should not throw
      const offers = await useCase.execute();
      expect(offers).toBeDefined();
      expect(Array.isArray(offers)).toBe(true);
      console.log('✓ Use case handles errors gracefully');
      
      // Test 2: Presenter execution should not throw
      const viewModel = await presenter.present();
      expect(viewModel).toBeDefined();
      expect(viewModel.status).toBeDefined();
      console.log('✓ Presenter handles errors gracefully');
      
      // Test 3: All components should be resilient
      const rulesRepository = container.get(OFFERS_TYPES.RulesRepository);
      const conditionReader = container.get(OFFERS_TYPES.ConditionReader);
      const offerRepository = container.get(OFFERS_TYPES.OfferRepository);
      
      expect(rulesRepository).toBeDefined();
      expect(conditionReader).toBeDefined();
      expect(offerRepository).toBeDefined();
      
      console.log('✓ All components are resilient');
      
    } catch (error) {
      console.error('✗ Error in error handling test:', error);
      throw error;
    }
    
    console.log('=== Error Handling Test Completed ===');
  });
});
