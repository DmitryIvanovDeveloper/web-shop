import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Container } from 'inversify';
import { ValidateAppLoginUseCase } from '../../application/use-cases/validate-app-login.use-case';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AuthUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated.handler';
import { AuthPresenter } from '../../interface-adapters/presenters/auth.presenter';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import type { Logger } from '../../../../application/ports/logger.port';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { Result } from '../../../../shared/domain/result/result';
import { bindAuthentication } from '../../infrastructure/bootstrap/bind.authentication';

// Define types locally to avoid importing the main container
const AUTH_TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  ValidateAppLoginUseCase: Symbol.for('ValidateAppLoginUseCase'),
  UserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>')
} as const;

const ROOT_TYPES = {
  Logger: Symbol.for('Logger'),
  HttpClient: Symbol.for('HttpClient'),
  EventBus: Symbol.for('IEventBus')
} as const;

// Create a mock EventBus that implements IEventBus interface
const mockEventBus = {
  publishAsync: vi.fn().mockImplementation(async (event: any) => {
    console.log('[MockEventBus] Publishing event:', event.type);
  }),
};

describe('Authentication with EventBus Integration', () => {
  let container: Container;
  let useCase: ValidateAppLoginUseCase;
  let mockHttpClient: HttpClient;
  let mockLogger: Logger;
  let authHandler: AuthUserAuthenticatedHandler;

  beforeEach(() => {
    // Очистить localStorage перед каждым тестом
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    container = new Container();
    
    // Mock Logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    } as unknown as Logger;
    
    // Mock HttpClient
    mockHttpClient = {
      get: vi.fn().mockResolvedValue({
        data: {
          'APP123': { userId: '1', username: 'testuser', appId: 'APP123' }
        },
        status: 200,
        statusText: 'OK',
        headers: {}
      })
    } as unknown as HttpClient;
    
        // Bind infrastructure
        container.bind<Logger>(ROOT_TYPES.Logger).toConstantValue(mockLogger);
        container.bind<HttpClient>(ROOT_TYPES.HttpClient).toConstantValue(mockHttpClient);
        container.bind(ROOT_TYPES.EventBus).toConstantValue(mockEventBus);
        
        // Bind authentication module using bindAuthentication
        bindAuthentication(container);
    
    // Get instances
    useCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
    authHandler = container.get<AuthUserAuthenticatedHandler>(AUTH_TYPES.UserAuthenticatedHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should publish UserAuthenticatedEvent after successful login', async () => {
    const result = await useCase.execute({ appId: 'APP123' });
    
    expect(result.isSuccess()).toBe(true);
    expect(result.data?.username).toBe('testuser');
    
    // Проверка публикации события
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[ValidateAppLoginUseCase] Publishing UserAuthenticatedEvent'
    );
    
    // Проверка вызова EventBus
    // UserRegisteredEvent is now published by UserAuthenticatedEventHandler, not directly from ValidateAppLoginUseCase
    expect(mockEventBus.publishAsync).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publishAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UserAuthenticatedEvent',
        userId: '1',
        username: 'testuser',
        appId: 'APP123',
      })
    );
  });

  it('should save user to localStorage on successful login', async () => {
    // Mock window.localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    await useCase.execute({ appId: 'APP123' });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      expect.stringContaining('"userId":"1"')
    );
  });

  it('should not publish event on failed login', async () => {
    vi.mocked(mockHttpClient.get).mockResolvedValue({ 
      data: {}, 
      status: 200, 
      statusText: 'OK', 
      headers: {} 
    });
    
    const handleAsyncSpy = vi.spyOn(authHandler, 'handleAsync');
    
    const result = await useCase.execute({ appId: 'INVALID' });
    
    expect(result.isFailure()).toBe(true);
    expect(handleAsyncSpy).not.toHaveBeenCalled();
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(mockHttpClient.get).mockRejectedValue(new Error('Network error'));
    
    const result = await useCase.execute({ appId: 'APP123' });
    
    expect(result.isFailure()).toBe(true);
    expect(mockEventBus.publishAsync).not.toHaveBeenCalled();
    // Логирование ошибок происходит в AuthRepository, не в UseCase
  });

  it('should handle empty appId validation', async () => {
    const result = await useCase.execute({ appId: '' });
    
    expect(result.isFailure()).toBe(true);
    expect(mockEventBus.publishAsync).not.toHaveBeenCalled();
  });

  it('should handle multiple successful logins', async () => {
    await useCase.execute({ appId: 'APP123' });
    await useCase.execute({ appId: 'APP123' });
    
    // Each login publishes only UserAuthenticatedEvent (UserRegisteredEvent is handled by UserAuthenticatedEventHandler)
    expect(mockEventBus.publishAsync).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
  });

  it('should integrate with EventBus publishAsync method', async () => {
    await useCase.execute({ appId: 'APP123' });
    
    // UserRegisteredEvent is now published by UserAuthenticatedEventHandler, not directly from ValidateAppLoginUseCase
    expect(mockEventBus.publishAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UserAuthenticatedEvent',
        userId: '1',
        username: 'testuser',
        appId: 'APP123'
      })
    );
    // Verify that UserAuthenticatedEvent contains isNewUser metadata
    const authenticatedEventCall = mockEventBus.publishAsync.mock.calls.find(
      call => call[0]?.type === 'UserAuthenticatedEvent'
    );
    expect(authenticatedEventCall).toBeDefined();
    expect(authenticatedEventCall[0].payload.metadata?.isNewUser).toBeDefined();
  });
});
 