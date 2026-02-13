import { inject, injectable } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import type { UserOfferContextReaderPort } from '../../../../modules/user-offer-context/application/ports/user-offer-context-reader.port';
import type { ComparableValue } from '../../domain/types';
import { USER_OFFER_CONTEXT_TYPES } from '../../../../modules/user-offer-context/infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { EvaluateOffersUseCase } from './evaluate-offers.use-case';
import type {
  SelectOffersInput,
  SelectOffersOutput,
  SelectOffersUseCase,
} from './select-offers.contract';

@injectable()
export class SelectOffersInteractor implements SelectOffersUseCase {
  public constructor(
    @inject(OFFERS_TYPES.EvaluateOffersUseCase)
    private readonly evaluateOffers: EvaluateOffersUseCase,
    @inject(USER_OFFER_CONTEXT_TYPES.ContextReader)
    private readonly contextRepository: UserOfferContextReaderPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: SelectOffersInput): Promise<SelectOffersOutput> {
    this.logger.info('[SelectOffersInteractor] Starting offer selection', {
      appId: input.appId,
      userId: input.userId,
      scenarioSlugs: input.scenarioSlugs,
      hasScenarioSlugs: !!input.scenarioSlugs && input.scenarioSlugs.length > 0,
      hasContextSnapshot: !!input.contextSnapshot,
    });

        const snapshot = input.contextSnapshot ?? await this.contextRepository.load(input.appId, input.userId);
    const contextCache = this.createCache(snapshot?.data ?? {});
    
    this.logger.info('[SelectOffersInteractor] Context prepared', {
      appId: input.appId,
      userId: input.userId,
      hasSnapshot: !!snapshot,
      contextKeys: Array.from(contextCache.keys()),
      contextSize: contextCache.size,
    });

    this.logger.info('[SelectOffersInteractor] Context loaded', {
      appId: input.appId,
      userId: input.userId,
      contextKeys: Array.from(contextCache.keys()),
      userFlagsIsNew: contextCache.get('user.flags.isNew'),
    });

    const overrides = input.overrides ?? {};
    for (const [key, value] of Object.entries(overrides)) {
      contextCache.set(key, value);
    }

    const offers = await this.evaluateOffers.execute({
      appId: input.appId,
      userId: input.userId,
      contextCache,
      allowedScenarios: input.scenarioSlugs,
    });

    this.logger.info('[SelectOffersInteractor] Offers evaluated', {
      appId: input.appId,
      userId: input.userId,
      offersCount: offers.length,
      offerIds: offers.map(o => o.id),
    });

    return { offers };
  }

  private createCache(context: Record<string, unknown>): Map<string, ComparableValue> {
    const cache = new Map<string, ComparableValue>();
    for (const [key, value] of Object.entries(context)) {
      if (value === null || value === undefined) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cache.set(key, value);
      }
    }
    return cache;
  }
}




















