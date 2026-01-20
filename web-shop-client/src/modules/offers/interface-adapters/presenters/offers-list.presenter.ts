import { inject, injectable } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import type { SelectOffersUseCase } from '../../application/use-cases/select-offers.contract';
import type { OffersListViewModel, OffersLabels } from '../view-models/offers-list.view-model';
import type { AuthServicePort } from '../../../authentication/application/services';
import { AUTH_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class OffersListPresenter {
  private _labels: OffersLabels = {
    offersTitle: 'Offers',
    emptyState: 'No offers available',
    loadingState: 'Loading offers...',
    featuredTitle: 'Featured',
    expiredBadge: 'Expired'
  };

  
  public updateLabelsFromTranslations(translations: Record<string, string>): void {
    this._labels = {
      offersTitle: translations['offers.title'] || 'Offers',
      emptyState: translations['offers.emptyState'] || 'No offers available',
      loadingState: translations['offers.loadingState'] || 'Loading offers...',
      featuredTitle: translations['offers.featuredTitle'] || 'Featured',
      expiredBadge: translations['offers.expiredBadge'] || 'Expired'
    };
  }

  public constructor(
    @inject(OFFERS_TYPES.SelectOffersUseCase)
    private readonly selectOffersUseCase: SelectOffersUseCase,
    @inject(AUTH_TYPES.AuthService)
    private readonly authService: AuthServicePort
  ) {}

  public async present(): Promise<OffersListViewModel> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        return {
          status: 'success',
          offers: [],
          labels: this._labels
        };
      }

      const { offers } = await this.selectOffersUseCase.execute({
        appId: currentUser.appId,
        userId: currentUser.userId,
      });
      return { status: 'success', offers, labels: this._labels };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to load offers',
        labels: this._labels
      };
    }
  }
}
