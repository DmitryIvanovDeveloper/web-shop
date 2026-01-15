import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { AuthPresenter } from '../presenters/auth.presenter';

@injectable()
export class AuthLocalizationLoadedEventHandler implements IAsyncEventHandler<LocalizationLoadedEvent> {
  constructor(
    @inject(AUTH_TYPES.AuthPresenter)
    private readonly _authPresenter: AuthPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationLoadedEvent): boolean {
    return event.type === 'LocalizationLoadedEvent';
  }

  public async handleAsync(event: LocalizationLoadedEvent): Promise<void> {
    this._logger.info('[AuthLocalizationLoadedEventHandler] Localization loaded event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the auth presenter with the loaded translations
    this._authPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[AuthLocalizationLoadedEventHandler] Auth presenter labels updated');
  }
}
