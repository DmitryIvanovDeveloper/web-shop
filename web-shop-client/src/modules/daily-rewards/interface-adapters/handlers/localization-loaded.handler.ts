import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DailyRewardsPresenter } from '../presenters/daily-rewards-presenter';

@injectable()
export class DailyRewardsLocalizationLoadedEventHandler implements IAsyncEventHandler<LocalizationLoadedEvent> {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardsPresenter)
    private readonly _dailyRewardsPresenter: DailyRewardsPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationLoadedEvent): boolean {
    return event.type === 'LocalizationLoadedEvent';
  }

  public async handleAsync(event: LocalizationLoadedEvent): Promise<void> {
    this._logger.info('[DailyRewardsLocalizationLoadedEventHandler] Localization loaded event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the daily rewards presenter with the loaded translations
    this._dailyRewardsPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[DailyRewardsLocalizationLoadedEventHandler] Daily rewards presenter labels updated');
  }
}

