import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class OffersUserAuthenticatedHandler implements IAsyncEventHandler<UserAuthenticatedEvent> {
  constructor(
    @inject(OFFERS_TYPES.EvaluateOffersUseCase)
    private readonly evaluateOffersUseCase: EvaluateOffersUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  canHandle(event: UserAuthenticatedEvent): boolean {
    return event.type === 'UserAuthenticatedEvent';
  }

  async handleAsync(event: UserAuthenticatedEvent): Promise<void> {
    this.logger.info('[OffersHandler] User authenticated, evaluating offers', {
      userId: event.userId
    });

    try {
      // Загрузка offers by rules для авторизованного пользователя
      const offers = await this.evaluateOffersUseCase.execute({
        contextCache: new Map()
      });

      this.logger.info('[OffersHandler] Offers evaluated successfully', {
        offersCount: offers.length
      });
      // TODO: Обновить presenter с офферами
    } catch (error) {
      this.logger.error('[OffersHandler] Exception during offers evaluation', error);
    }
  }
}
