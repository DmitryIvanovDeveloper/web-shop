import { inject, injectable } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import type { SelectOffersUseCase } from '../../application/use-cases/select-offers.contract';
import type { OffersListViewModel } from '../view-models/offers-list.view-model';
import type { AuthServicePort } from '../../../authentication/application/services';
import { AUTH_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class OffersListPresenter {
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
        };
      }

      const { offers } = await this.selectOffersUseCase.execute({
        appId: currentUser.appId,
        userId: currentUser.userId,
      });
      return { status: 'success', offers };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to load offers'
      };
    }
  }
}
