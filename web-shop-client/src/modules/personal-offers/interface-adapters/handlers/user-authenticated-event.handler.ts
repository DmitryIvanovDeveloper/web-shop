import { inject, injectable } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PERSONAL_OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { PersonalOffersPresenter } from '../presenters/personal-offers.presenter';
import { USER_OFFER_CONTEXT_TYPES } from '../../../user-offer-context/infrastructure/bootstrap/types';
import type { UserOfferContextReaderPort } from '../../../user-offer-context/application/ports/user-offer-context-reader.port';

@injectable()
export class PersonalOffersUserAuthenticatedHandler
  implements IAsyncEventHandler<UserAuthenticatedEvent>
{
  public constructor(
    @inject(PERSONAL_OFFERS_TYPES.Presenter)
    private readonly presenter: PersonalOffersPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger,
    @inject(USER_OFFER_CONTEXT_TYPES.ContextReader)
    private readonly contextReader: UserOfferContextReaderPort,
  ) {}

  public canHandle(event: UserAuthenticatedEvent): boolean {
    return event.type === 'UserAuthenticatedEvent';
  }

  public async handleAsync(event: UserAuthenticatedEvent): Promise<void> {
    const isNewUserFromEvent = event.metadata?.isNewUser ?? false;
    
    this.logger.info('[PersonalOffersHandler] User authenticated, loading personal offers.', {
      userId: event.userId,
      appId: event.appId,
      isNewUser: isNewUserFromEvent,
    });

    try {
      // Load context once at the beginning (no waiting loops - use defaults if not ready)
      // This context will be reused in SelectOffersInteractor to avoid double loading
      const context = await this.contextReader.load(event.appId, event.userId);
      
      this.logger.info('[PersonalOffersHandler] Context loaded', {
        userId: event.userId,
        appId: event.appId,
        hasContext: !!context,
        contextData: context?.data,
        isNewUserFromEvent,
      });
      
      // Determine if user is new from event metadata or context
      // Use event metadata as primary source, fallback to context if available
      let isNewUser = isNewUserFromEvent;
      if (!isNewUser && context?.data?.['user.flags.isNew'] === true) {
        isNewUser = true;
        this.logger.info('[PersonalOffersHandler] User is new according to offer context', {
          userId: event.userId,
          appId: event.appId,
        });
      }

      // For new users, show welcome-new-user scenario
      // For returning users, show all matching offers (no scenario filter)
      const scenarioSlugs = isNewUser ? ['welcome-new-user'] : undefined;

      this.logger.info('[PersonalOffersHandler] Showing offers', {
        appId: event.appId,
        userId: event.userId,
        isNewUser,
        scenarioSlugs,
        willShowAllOffers: !scenarioSlugs,
      });

      // Pass user flags via overrides to ensure condition evaluation works
      // Use context values if available, otherwise use defaults (handled by PropertyReadersService)
      // This avoids race conditions and eliminates the need for waiting loops
      const overrides: Record<string, any> = {};
      if (isNewUser) {
        overrides['user.flags.isNew'] = true;
      } else {
        // For returning users, set isNew flag to false directly via overrides
        overrides['user.flags.isNew'] = false;
        
        // Use context value if available, otherwise PropertyReadersService will use default (0)
        const purchasesLength = context?.data?.['user.purchases.length'];
        if (purchasesLength !== undefined) {
          overrides['user.purchases.length'] = purchasesLength;
        }
        
        this.logger.info('[PersonalOffersHandler] Returning user context prepared', {
          userId: event.userId,
          appId: event.appId,
          purchasesLength: purchasesLength ?? 'will use default',
          note: 'No waiting loops - using context if available, defaults otherwise',
        });
      }

      await this.presenter.showOffers({
        appId: event.appId,
        userId: event.userId,
        scenarioSlugs,
        overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
        contextSnapshot: context ?? undefined, // Pass context to avoid reloading
      });

      this.logger.info('[PersonalOffersHandler] Personal offers handled successfully.');
    } catch (error) {
      this.logger.error('[PersonalOffersHandler] Failed to handle personal offers.', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}


