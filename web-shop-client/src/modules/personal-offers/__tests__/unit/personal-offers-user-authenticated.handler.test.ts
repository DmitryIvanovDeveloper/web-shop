import { describe, it, expect, vi } from 'vitest';
import { PersonalOffersUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated-event.handler';
import { PersonalOffersPresenter } from '../../interface-adapters/presenters/personal-offers.presenter';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import type { UserOfferContextReaderPort } from '../../../../modules/user-offer-context/application/ports/user-offer-context-reader.port';

describe('PersonalOffersUserAuthenticatedHandler', () => {
  const presenter = {
    showOffers: vi.fn(),
  } as unknown as PersonalOffersPresenter;

  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  const contextReader = {
    load: vi.fn().mockResolvedValue({ data: { 'user.purchases.length': 0 } }),
  } as unknown as UserOfferContextReaderPort;

  const handler = new PersonalOffersUserAuthenticatedHandler(presenter, logger, contextReader);

  it('handles UserAuthenticatedEvent for new user', async () => {
    const event = new UserAuthenticatedEvent('user-1', 'john', 'APP123', { isNewUser: true });

    await handler.handleAsync(event);

    expect(presenter.showOffers).toHaveBeenCalledWith({
      appId: 'APP123',
      userId: 'user-1',
      scenarioSlugs: ['welcome-new-user'],
      overrides: {
        'user.flags.isNew': true,
      },
    });
  });

  it('handles UserAuthenticatedEvent for returning user', async () => {
    const event = new UserAuthenticatedEvent('user-2', 'lisa', 'APP123', { isNewUser: false });

    presenter.showOffers = vi.fn();
    (contextReader.load as any).mockResolvedValueOnce({
      data: { 'user.purchases.length': 0 },
    });

    await handler.handleAsync(event);

    expect(presenter.showOffers).toHaveBeenCalledWith({
      appId: 'APP123',
      userId: 'user-2',
      scenarioSlugs: undefined,
      overrides: {
        'user.flags.isNew': false,
        'user.purchases.length': 0,
      },
    });
  });

  it('canHandle only UserAuthenticatedEvent', () => {
    const event = new UserAuthenticatedEvent('user-3', 'sam', 'APP123', {});
    expect(handler.canHandle(event)).toBe(true);
  });
});


