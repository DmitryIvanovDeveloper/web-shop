import { injectable, inject } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import type { OffersListViewModel } from '../view-models/offers-list.view-model';

@injectable()
export class OffersListPresenter {
  constructor(
    @inject(OFFERS_TYPES.EvaluateOffersUseCase)
    private readonly evaluateOffersUseCase: EvaluateOffersUseCase
  ) {}

  public async present(): Promise<OffersListViewModel> {
    try {
      const offers = await this.evaluateOffersUseCase.execute();
      return { status: 'success', offers };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to load offers'
      };
    }
  }
}
