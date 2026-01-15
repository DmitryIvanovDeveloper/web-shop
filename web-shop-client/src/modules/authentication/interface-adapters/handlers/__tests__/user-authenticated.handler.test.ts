import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthUserAuthenticatedHandler } from '../user-authenticated.handler';
import { UserAuthenticatedEvent } from '../../../../domain/events';
import type { Logger } from '../../../../../application/ports/logger.port';
import { AuthPresenter } from '../../presenters/auth.presenter';

describe('AuthUserAuthenticatedHandler', () => {
  let handler: AuthUserAuthenticatedHandler;
  let mockLogger: Logger;
  let mockAuthPresenter: AuthPresenter;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    } as unknown as Logger;

    mockAuthPresenter = {
      setAuthenticated: vi.fn(),
      isUserAuthenticated: vi.fn(),
      getCurrentUser: vi.fn()
    } as unknown as AuthPresenter;
    
    handler = new AuthUserAuthenticatedHandler(mockLogger, mockAuthPresenter);
  });

  it('should handle UserAuthenticatedEvent', async () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    
    expect(handler.canHandle(event)).toBe(true);
    
    await handler.handleAsync(event);
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[AuthHandler] User authenticated event received',
      {
        userId: 'user-123',
        username: 'testuser',
        appId: 'APP123'
      }
    );

    expect(mockAuthPresenter.setAuthenticated).toHaveBeenCalledWith({
      userId: 'user-123',
      username: 'testuser',
      appId: 'APP123'
    });
  });

  it('should not handle event with wrong type', () => {
    const event = { type: 'WrongEvent' } as any;
    
    expect(handler.canHandle(event)).toBe(false);
  });

  it('should handle multiple events', async () => {
    const event1 = new UserAuthenticatedEvent('user-1', 'user1', 'APP1');
    const event2 = new UserAuthenticatedEvent('user-2', 'user2', 'APP2');
    
    await handler.handleAsync(event1);
    await handler.handleAsync(event2);
    
    expect(mockLogger.info).toHaveBeenCalledTimes(4); // 2 events * 2 info calls each
    
    // Check that both events were processed
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[AuthHandler] User authenticated event received',
      {
        userId: 'user-1',
        username: 'user1',
        appId: 'APP1'
      }
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[AuthHandler] User authenticated event received',
      {
        userId: 'user-2',
        username: 'user2',
        appId: 'APP2'
      }
    );
  });

  it('should handle empty or undefined event properties', async () => {
    const event = new UserAuthenticatedEvent('', '', '');
    
    await handler.handleAsync(event);
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[AuthHandler] User authenticated event received',
      {
        userId: '',
        username: '',
        appId: ''
      }
    );
  });

  it('should be able to handle the same event multiple times', () => {
    const event = new UserAuthenticatedEvent('user-123', 'testuser', 'APP123');
    
    expect(handler.canHandle(event)).toBe(true);
    expect(handler.canHandle(event)).toBe(true);
    expect(handler.canHandle(event)).toBe(true);
  });
});
