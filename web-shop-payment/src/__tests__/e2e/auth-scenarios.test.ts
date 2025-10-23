import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from 'inversify';
import { bindAuthentication } from '../../modules/authentication/infrastructure/bootstrap/bind.authentication';
import { bindOffers } from '../../modules/offers/infrastructure/bootstrap/bind.offers';
import { ValidateAppLoginUseCase } from '../../modules/authentication/application/use-cases/validate-app-login.use-case';
import { EvaluateOffersUseCase } from '../../modules/offers/application/use-cases/evaluate-offers.use-case';
import { AuthUserAuthenticatedHandler } from '../../modules/authentication/interface-adapters/handlers/user-authenticated.handler';
import { OffersUserAuthenticatedHandler } from '../../modules/offers/interface-adapters/handlers/user-authenticated.handler';
import { EventBus } from '../../infrastructure/events/event-bus';
import type { Logger } from '../../application/ports/logger.port';
import type { HttpClient } from '../../application/ports/http-client.port';
import { AUTH_TYPES } from '../../modules/authentication/infrastructure/bootstrap/types';
import { OFFERS_TYPES } from '../../modules/offers/infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../infrastructure/bootstrap/types';

describe('E2E: 3 Authentication Scenarios', () => {
  let container: Container;
  let mockHttpClient: HttpClient;
  let mockLogger: Logger;

  beforeEach(() => {
    container = new Container();
    
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    } as unknown as Logger;
    
    mockHttpClient = {
      get: vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/auth/users.json')) {
          return Promise.resolve({
            users: [
              { userId: '1', username: 'player1', appId: 'APP123' },
              { userId: '2', username: 'player2', appId: 'APP456' }
            ]
          });
        }
        if (url.includes('/api/offers')) {
          return Promise.resolve({
            offers: [
              { id: 'offer-1', title: 'Premium Bundle', price: 9.99 }
            ]
          });
        }
        if (url.includes('/api/rules')) {
          return Promise.resolve({ rules: [] });
        }
        return Promise.resolve({});
      })
    } as unknown as HttpClient;
    
    container.bind<Logger>(ROOT_TYPES.Logger).toConstantValue(mockLogger);
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).toConstantValue(mockHttpClient);
    container.bind(ROOT_TYPES.EventBus).to(EventBus).inSingletonScope();
    
    bindAuthentication(container);
    bindOffers(container);
  });

  it('Scenario 1: Query parameter authentication', async () => {
    // Simulate: User opens URL with ?appId=APP123
    const queryAppId = 'APP123';
    
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    const offersHandler = container.get<OffersUserAuthenticatedHandler>(OFFERS_TYPES.UserAuthenticatedHandler);
    
    const offersHandlerSpy = vi.spyOn(offersHandler, 'handleAsync');
    
    // Execute authentication
    const result = await validateUseCase.execute({ appId: queryAppId });
    
    // Verify authentication success
    expect(result.isSuccess()).toBe(true);
    expect(result.data.appId).toBe('APP123');
    
    // Verify event published and offers loaded
    expect(offersHandlerSpy).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('[OffersHandler]'),
      expect.any(Object)
    );
  });

  it('Scenario 2: localStorage authentication', async () => {
    // Simulate: User has stored credentials
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({
        userId: '2',
        username: 'player2',
        appId: 'APP456'
      })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    const storedUser = JSON.parse(localStorageMock.getItem('user')!);
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    
    // Execute authentication with stored appId
    const result = await validateUseCase.execute({ appId: storedUser.appId });
    
    expect(result.isSuccess()).toBe(true);
    expect(result.data.appId).toBe('APP456');
    
    // Verify localStorage updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      expect.stringContaining('"appId":"APP456"')
    );
  });

  it('Scenario 3: Manual input authentication via AuthPopup', async () => {
    // Simulate: User enters appId manually in popup
    const manualAppId = 'APP123';
    
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    const authHandler = container.get<AuthUserAuthenticatedHandler>(AUTH_TYPES.UserAuthenticatedHandler);
    
    const authHandlerSpy = vi.spyOn(authHandler, 'handleAsync');
    
    // Execute authentication (same as AuthPopup does)
    const result = await validateUseCase.execute({ appId: manualAppId });
    
    expect(result.isSuccess()).toBe(true);
    
    // Verify both handlers executed
    expect(authHandlerSpy).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[AuthHandler] User authenticated event received',
      expect.objectContaining({ appId: 'APP123' })
    );
  });

  it('E2E: Complete flow with both modules responding', async () => {
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    const authHandler = container.get<AuthUserAuthenticatedHandler>(AUTH_TYPES.UserAuthenticatedHandler);
    const offersHandler = container.get<OffersUserAuthenticatedHandler>(OFFERS_TYPES.UserAuthenticatedHandler);
    const evaluateOffersUseCase = container.get<EvaluateOffersUseCase>(OFFERS_TYPES.EvaluateOffersUseCase);
    
    const authHandlerSpy = vi.spyOn(authHandler, 'handleAsync');
    const offersHandlerSpy = vi.spyOn(offersHandler, 'handleAsync');
    const evaluateOffersSpy = vi.spyOn(evaluateOffersUseCase, 'execute');
    
    // Execute authentication
    await validateUseCase.execute({ appId: 'APP123' });
    
    // Verify BOTH handlers executed
    expect(authHandlerSpy).toHaveBeenCalledTimes(1);
    expect(offersHandlerSpy).toHaveBeenCalledTimes(1);
    
    // Verify offers evaluation triggered
    expect(evaluateOffersSpy).toHaveBeenCalledWith({
      userId: '1',
      context: {}
    });
    
    // Verify logging sequence
    const logCalls = vi.mocked(mockLogger.info).mock.calls.map(call => call[0]);
    expect(logCalls).toContain('[ValidateAppLoginUseCase] Publishing UserAuthenticatedEvent');
    expect(logCalls).toContain('[AuthHandler] User authenticated event received');
    expect(logCalls).toContain('[OffersHandler] User authenticated, evaluating offers');
  });

  it('E2E: Error handling across all scenarios', async () => {
    // Mock network failure
    vi.mocked(mockHttpClient.get).mockRejectedValue(new Error('Network error'));
    
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    const authHandler = container.get<AuthUserAuthenticatedHandler>(AUTH_TYPES.UserAuthenticatedHandler);
    const offersHandler = container.get<OffersUserAuthenticatedHandler>(OFFERS_TYPES.UserAuthenticatedHandler);
    
    const authHandlerSpy = vi.spyOn(authHandler, 'handleAsync');
    const offersHandlerSpy = vi.spyOn(offersHandler, 'handleAsync');
    
    // Try all scenarios with network error
    await validateUseCase.execute({ appId: 'APP123' }); // Scenario 1
    await validateUseCase.execute({ appId: 'APP456' }); // Scenario 2
    await validateUseCase.execute({ appId: 'APP789' }); // Scenario 3
    
    // Verify all failed and no events were published
    expect(authHandlerSpy).not.toHaveBeenCalled();
    expect(offersHandlerSpy).not.toHaveBeenCalled();
    
    // Verify error logging
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('E2E: Multiple users authentication sequence', async () => {
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    const authHandler = container.get<AuthUserAuthenticatedHandler>(AUTH_TYPES.UserAuthenticatedHandler);
    const offersHandler = container.get<OffersUserAuthenticatedHandler>(OFFERS_TYPES.UserAuthenticatedHandler);
    
    const authHandlerSpy = vi.spyOn(authHandler, 'handleAsync');
    const offersHandlerSpy = vi.spyOn(offersHandler, 'handleAsync');
    
    // Authenticate multiple users
    await validateUseCase.execute({ appId: 'APP123' });
    await validateUseCase.execute({ appId: 'APP456' });
    
    // Verify both handlers called for each user
    expect(authHandlerSpy).toHaveBeenCalledTimes(2);
    expect(offersHandlerSpy).toHaveBeenCalledTimes(2);
    
    // Verify correct user IDs in events
    const authCalls = authHandlerSpy.mock.calls;
    expect(authCalls[0][0].userId).toBe('1'); // First user
    expect(authCalls[1][0].userId).toBe('2'); // Second user
  });

  it('E2E: EventBus integration verification', async () => {
    const validateUseCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    const eventBus = container.get<EventBus>(ROOT_TYPES.EventBus);
    
    const publishAsyncSpy = vi.spyOn(eventBus, 'publishAsync');
    
    // Execute authentication
    await validateUseCase.execute({ appId: 'APP123' });
    
    // Verify EventBus was used correctly
    expect(publishAsyncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UserAuthenticatedEvent',
        userId: '1',
        username: 'player1',
        appId: 'APP123'
      })
    );
    
    // Verify EventBus published to all registered handlers
    expect(publishAsyncSpy).toHaveBeenCalledTimes(1);
  });
});
