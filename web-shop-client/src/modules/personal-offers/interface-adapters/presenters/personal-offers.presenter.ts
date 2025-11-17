import { inject, injectable } from 'inversify';
import type { SelectOffersUseCase } from '../../../offers/application/use-cases/select-offers.contract';
import { OFFERS_TYPES } from '../../../offers/infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PersonalOffersViewModel } from '../view-models/personal-offers.view-model';
import type { UserOfferContextSnapshot } from '../../../user-offer-context/application/ports/context.types';

import type { ComparableValue } from '../../../offers/domain/types';

export interface ShowPersonalOffersInput {
  readonly appId: string;
  readonly userId: string;
  readonly scenarioSlugs?: readonly string[];
  readonly overrides?: Readonly<Record<string, ComparableValue>>;
  readonly contextSnapshot?: UserOfferContextSnapshot;
}

@injectable()
export class PersonalOffersPresenter {
  public readonly labels = {
    title: 'Special offers just for you',
    close: 'Close',
    dismiss: 'Maybe later',
    error: 'We could not load personal offers right now.',
    empty: 'No personal offers available at the moment.',
  };

  private viewModel: PersonalOffersViewModel = {
    status: 'idle',
    offers: [],
    isVisible: false,
  };

  private onViewModelChanged?: () => void;

  public constructor(
    @inject(OFFERS_TYPES.SelectOffersUseCase)
    private readonly selectOffersUseCase: SelectOffersUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger,
  ) {}

  public setOnViewModelChanged(callback: () => void): void {
    this.onViewModelChanged = callback;
  }

  public getViewModel(): PersonalOffersViewModel {
    return this.viewModel;
  }

  public async showOffers(input: ShowPersonalOffersInput): Promise<void> {
    const { appId, userId, scenarioSlugs, overrides, contextSnapshot } = input;

    if (!appId || !userId) {
      this.logger.warn('[PersonalOffersPresenter] Missing appId or userId. Popup will stay hidden.', {
        appId,
        userId,
      });
      this.updateViewModel({
        status: 'error',
        offers: [],
        isVisible: false,
        errorMessage: this.labels.error,
      });
      return;
    }

    this.updateViewModel({
      status: 'loading',
      offers: [],
      isVisible: true,
    });

    try {
      this.logger.info('[PersonalOffersPresenter] Calling SelectOffersUseCase', {
        appId,
        userId,
        scenarioSlugs,
        hasScenarioSlugs: !!scenarioSlugs && scenarioSlugs.length > 0,
      });

      const result = await this.selectOffersUseCase.execute({
        appId,
        userId,
        scenarioSlugs,
        overrides,
        contextSnapshot: input.contextSnapshot,
      });

      this.logger.info('[PersonalOffersPresenter] SelectOffersUseCase returned', {
        appId,
        userId,
        offersCount: result.offers.length,
        offerIds: result.offers.map(o => o.id),
      });

      const { offers } = result;

      if (offers.length === 0) {
        this.logger.info('[PersonalOffersPresenter] No personal offers found.', { 
          appId, 
          userId,
          scenarioSlugs,
          wasScenarioSlugsProvided: !!scenarioSlugs && scenarioSlugs.length > 0,
        });
        this.updateViewModel({
          status: 'success',
          offers: [],
          isVisible: false,
          lastUpdatedAt: new Date().toISOString(),
        });
        return;
      }

      this.logger.info('[PersonalOffersPresenter] Personal offers ready.', {
        appId,
        userId,
        offersCount: offers.length,
      });
      this.updateViewModel({
        status: 'success',
        offers,
        isVisible: true,
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('[PersonalOffersPresenter] Failed to load personal offers.', {
        error: error instanceof Error ? error.message : error,
        appId,
        userId,
      });
      this.updateViewModel({
        status: 'error',
        offers: [],
        isVisible: false,
        errorMessage: this.labels.error,
      });
    }
  }

  public hideOffers(): void {
    if (!this.viewModel.isVisible) {
      return;
    }

    this.logger.debug('[PersonalOffersPresenter] Hiding personal offers popup.');
    this.updateViewModel({
      ...this.viewModel,
      isVisible: false,
    });
  }

  private updateViewModel(next: PersonalOffersViewModel): void {
    this.viewModel = next;
    if (this.onViewModelChanged) {
      this.onViewModelChanged();
    }
  }
}


