import { describe, expect, it, vi } from 'vitest';
import { SelectOffersInteractor } from '../../application/use-cases/select-offers.use-case';
import type { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import type { UserOfferContextPort } from '../../application/ports/user-offer-context.port';
import type { Offer } from '../../domain/types';

describe('SelectOffersInteractor', () => {
  it('loads context, applies overrides, and filters by scenarios', async () => {
    const contextMap = new Map<string, string | number | boolean>([['user.flags.isNew', false]]);
    const mockContextRepository: UserOfferContextPort = {
      loadContext: vi.fn().mockResolvedValue(contextMap),
    };

    const offers: Offer[] = [
      { id: 'welcome-offer', title: 'Welcome Bundle' },
    ];

    const executeSpy = vi.fn().mockResolvedValue(offers);

    const mockEvaluateUseCase = {
      execute: executeSpy,
    } as unknown as EvaluateOffersUseCase;

    const interactor = new SelectOffersInteractor(mockEvaluateUseCase, mockContextRepository);

    const result = await interactor.execute({
      appId: 'APP123',
      userId: 'user-1',
      scenarioSlugs: ['welcome-new-user'],
      overrides: { 'user.flags.isNew': true },
    });

    expect(mockContextRepository.loadContext).toHaveBeenCalledWith('APP123', 'user-1');
    expect(executeSpy).toHaveBeenCalledTimes(1);

    const call = executeSpy.mock.calls[0]?.[0];
    expect(call?.appId).toBe('APP123');
    expect(call?.allowedScenarios).toEqual(['welcome-new-user']);
    expect(call?.contextCache).toBeInstanceOf(Map);
    expect(call?.contextCache.get('user.flags.isNew')).toBe(true);

    expect(result.offers).toEqual(offers);
    expect(contextMap.get('user.flags.isNew')).toBe(true);
  });
});


