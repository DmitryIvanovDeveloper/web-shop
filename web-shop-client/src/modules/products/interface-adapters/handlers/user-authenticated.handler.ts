import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ProductsListPresenter } from '../presenters/products-list.presenter';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Products User Authenticated Handler
 * 
 * Handles UserAuthenticatedEvent by reloading products with user context
 * Ensures purchased status updates after authentication
 */
@injectable()
export class ProductsUserAuthenticatedHandler implements IAsyncEventHandler<UserAuthenticatedEvent> {
  constructor(
    @inject(PRODUCTS_TYPES.ProductsListPresenter)
    private readonly productsListPresenter: ProductsListPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  canHandle(event: UserAuthenticatedEvent): boolean {
    return event.type === 'UserAuthenticatedEvent';
  }

  async handleAsync(event: UserAuthenticatedEvent): Promise<void> {
    this.logger.info('[ProductsHandler] User authenticated, reloading products', {
      userId: event.userId,
      appId: event.appId
    });

    try {
      // Reload products with user context from event
      await this.productsListPresenter.present({
        userId: event.userId,
        appId: event.appId
      });
      
      this.logger.info('[ProductsHandler] Products reloaded successfully after auth');

      // Trigger UI reload via browser event
      // This will cause ProductsList component to re-fetch and re-render
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productsNeedReload'));
      }
    } catch (error) {
      this.logger.error('[ProductsHandler] Failed to reload products after auth', error);
    }
  }
}

