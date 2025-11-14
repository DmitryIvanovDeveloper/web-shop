import { describe, it, expect, vi } from 'vitest';
import { UserAuthenticatedEventHandler } from '../../interface-adapters/handlers/user-authenticated-event.handler';
import { HandleUserRegisteredUseCase } from '../../application/use-cases/handle-user-registered.use-case';
import { HandleUserReturnedUseCase } from '../../application/use-cases/handle-user-returned.use-case';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';

describe('UserAuthenticatedEventHandler', () => {
  it('dispatches UserRegisteredEvent when metadata.isNewUser is true', async () => {
    const registerUseCase = { execute: vi.fn() } as unknown as HandleUserRegisteredUseCase;
    const returnedUseCase = { execute: vi.fn() } as unknown as HandleUserReturnedUseCase;

    const handler = new UserAuthenticatedEventHandler(registerUseCase, returnedUseCase);

    const event = new UserAuthenticatedEvent('user-1', 'test', 'APP123', { isNewUser: true });

    await handler.handleAsync(event);

    expect(registerUseCase.execute).toHaveBeenCalledTimes(1);
    expect(returnedUseCase.execute).not.toHaveBeenCalled();
  });

  it('dispatches UserReturnedEvent when metadata.isNewUser is false', async () => {
    const registerUseCase = { execute: vi.fn() } as unknown as HandleUserRegisteredUseCase;
    const returnedUseCase = { execute: vi.fn() } as unknown as HandleUserReturnedUseCase;

    const handler = new UserAuthenticatedEventHandler(registerUseCase, returnedUseCase);

    const event = new UserAuthenticatedEvent('user-1', 'test', 'APP123', { isNewUser: false });

    await handler.handleAsync(event);

    expect(returnedUseCase.execute).toHaveBeenCalledTimes(1);
    expect(registerUseCase.execute).not.toHaveBeenCalled();
  });
});


