import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OffersUserAuthenticatedHandler } from '../user-authenticated.handler';
import { UserAuthenticatedEvent } from '../../../../../shared/events/auth-events';
import { EvaluateOffersUseCase } from '../../../application/use-cases/evaluate-offers.use-case';
import type { Logger } from '../../../../../application/ports/logger.port';
import { Result } from '../../../../../shared/domain/result/result';

describe('OffersUserAuthenticatedHandler', () => {
  let handler: OffersUserAuthenticatedHandler;
  let mockUseCase: EvaluateOffersUseCase;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    } as unknown as Logger;
    
    mockUseCase = {
      execute: vi.fn()
    } as unknown as EvaluateOffersUseCase;
    
    handler = new OffersUserAuthenticatedHandler(mockUseCase, mockLogger);
  });

  it('should evaluate offers on user authenticated', async () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    const mockOffers = [{ id: 'offer-1' }, { id: 'offer-2' }];
    
    vi.mocked(mockUseCase.execute).mockResolvedValue(Result.ok(mockOffers as any));
    
    await handler.handleAsync(event);
    
    expect(mockUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-123',
      context: {}
    });
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[OffersHandler] User authenticated, evaluating offers',
      {
        userId: 'user-123'
      }
    );
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[OffersHandler] Offers evaluated successfully',
      { offersCount: 2 }
    );
  });

  it('should handle evaluation failure', async () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    const error = new Error('Failed to load offers');
    
    vi.mocked(mockUseCase.execute).mockResolvedValue(Result.fail(error as any));
    
    await handler.handleAsync(event);
    
    expect(mockLogger.error).toHaveBeenCalledWith(
      '[OffersHandler] Failed to evaluate offers',
      { error }
    );
  });

  it('should handle exceptions during evaluation', async () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    const error = new Error('Network error');
    
    vi.mocked(mockUseCase.execute).mockRejectedValue(error);
    
    await handler.handleAsync(event);
    
    expect(mockLogger.error).toHaveBeenCalledWith(
      '[OffersHandler] Exception during offers evaluation',
      { error }
    );
  });

  it('should not handle event with wrong type', () => {
    const event = { type: 'WrongEvent' } as any;
    
    expect(handler.canHandle(event)).toBe(false);
  });

  it('should handle empty offers result', async () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    const mockOffers = [];
    
    vi.mocked(mockUseCase.execute).mockResolvedValue(Result.ok(mockOffers as any));
    
    await handler.handleAsync(event);
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[OffersHandler] Offers evaluated successfully',
      { offersCount: 0 }
    );
  });

  it('should handle undefined use case result', async () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    
    vi.mocked(mockUseCase.execute).mockResolvedValue(undefined as any);
    
    await handler.handleAsync(event);
    
    expect(mockLogger.error).toHaveBeenCalledWith(
      '[OffersHandler] Failed to evaluate offers',
      { error: undefined }
    );
  });

  it('should handle multiple user authentication events', async () => {
    const event1 = new UserAuthenticatedEvent('user-1', 'user1', 'APP1');
    const event2 = new UserAuthenticatedEvent('user-2', 'user2', 'APP2');
    const mockOffers = [{ id: 'offer-1' }];
    
    vi.mocked(mockUseCase.execute).mockResolvedValue(Result.ok(mockOffers as any));
    
    await handler.handleAsync(event1);
    await handler.handleAsync(event2);
    
    expect(mockUseCase.execute).toHaveBeenCalledTimes(2);
    expect(mockUseCase.execute).toHaveBeenNthCalledWith(1, {
      userId: 'user-1',
      context: {}
    });
    expect(mockUseCase.execute).toHaveBeenNthCalledWith(2, {
      userId: 'user-2',
      context: {}
    });
  });
});
