import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DailyRewardsPresenter } from '../presenters/daily-rewards-presenter';

@injectable()
export class DailyRewardsLocalizationChangedEventHandler implements IAsyncEventHandler<LocalizationChangedEvent> {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardsPresenter)
    private readonly _dailyRewardsPresenter: DailyRewardsPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationChangedEvent): boolean {
    return event.type === 'LocalizationChangedEvent';
  }

  public async handleAsync(event: LocalizationChangedEvent): Promise<void> {
    this._logger.info('[DailyRewardsLocalizationChangedEventHandler] Localization changed event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the daily rewards presenter with the new translations
    this._dailyRewardsPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[DailyRewardsLocalizationChangedEventHandler] Daily rewards presenter labels updated after language change');
  }
}

