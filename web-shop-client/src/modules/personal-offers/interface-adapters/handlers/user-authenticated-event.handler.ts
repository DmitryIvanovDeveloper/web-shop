import { inject, injectable } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
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
    const isNewUserFromEvent = event.payload.metadata?.isNewUser ?? false;
    
    this.logger.info('[PersonalOffersHandler] User authenticated, loading personal offers.', {
      userId: event.userId,
      appId: event.appId,
      isNewUser: isNewUserFromEvent,
    });

    try {
      // Check both event metadata and offer context to determine if user is new
      // This handles race conditions where user might be created before event is processed
      let isNewUser = isNewUserFromEvent;
      
      if (!isNewUser) {
        // Load offer context to check user.flags.isNew
        // This handles race conditions where user might be created before event is processed
        // Wait a bit for UserRegisteredEvent to be processed and offer context to be updated
        this.logger.info('[PersonalOffersHandler] Checking offer context for user.flags.isNew', {
          userId: event.userId,
          appId: event.appId,
        });
        
        // Wait for UserRegisteredEvent to be processed (up to 2 seconds)
        let context = await this.contextReader.load(event.appId, event.userId);
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && context?.data?.['user.flags.isNew'] !== true) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
          context = await this.contextReader.load(event.appId, event.userId);
          attempts++;
        }
        
        this.logger.info('[PersonalOffersHandler] Offer context loaded', {
          userId: event.userId,
          appId: event.appId,
          hasContext: !!context,
          contextData: context?.data,
          isNewFlag: context?.data?.['user.flags.isNew'],
          attempts,
        });
        
        if (context?.data?.['user.flags.isNew'] === true) {
          isNewUser = true;
          this.logger.info('[PersonalOffersHandler] User is new according to offer context', {
            userId: event.userId,
            appId: event.appId,
          });
        } else {
          this.logger.info('[PersonalOffersHandler] User is not new according to offer context', {
            userId: event.userId,
            appId: event.appId,
            isNewFlag: context?.data?.['user.flags.isNew'],
          });
        }
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
      // This handles race conditions where offer context might not be updated yet
      // IMPORTANT: UserAuthenticatedEvent handlers run in parallel (Promise.all),
      // so UserReturnedEvent might not be processed yet when we check offer context.
      // We set user.flags.isNew directly via overrides to avoid race condition.
      const overrides: Record<string, any> = {};
      if (isNewUser) {
        overrides['user.flags.isNew'] = true;
      } else {
        // For returning users, set isNew flag to false directly via overrides
        // This avoids race condition where UserReturnedEvent handler might not have
        // updated offer context yet (both handlers run in parallel via Promise.all)
        overrides['user.flags.isNew'] = false;
        
        // Also need to check purchases.length - wait a bit for context to load
        // But don't wait too long, as UserReturnedEvent handler runs in parallel
        let context = await this.contextReader.load(event.appId, event.userId);
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts && context?.data?.['user.purchases.length'] === undefined) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
          context = await this.contextReader.load(event.appId, event.userId);
          attempts++;
        }
        
        const purchasesLength = context?.data?.['user.purchases.length'] ?? 0;
        overrides['user.purchases.length'] = purchasesLength;
        
        this.logger.info('[PersonalOffersHandler] Returning user context loaded', {
          userId: event.userId,
          appId: event.appId,
          purchasesLength,
          attempts,
          note: 'user.flags.isNew set to false via overrides to avoid race condition with UserReturnedEvent handler',
        });
      }

      await this.presenter.showOffers({
        appId: event.appId,
        userId: event.userId,
        scenarioSlugs,
        overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
      });

      this.logger.info('[PersonalOffersHandler] Personal offers handled successfully.');
    } catch (error) {
      this.logger.error('[PersonalOffersHandler] Failed to handle personal offers.', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}


