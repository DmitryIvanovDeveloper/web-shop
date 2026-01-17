import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { PatchNotesPublicPresenter } from '../presenters/patch-notes-public.presenter';

@injectable()
export class PatchNotesLocalizationLoadedEventHandler implements IAsyncEventHandler<LocalizationLoadedEvent> {
  constructor(
    @inject(PATCH_NOTES_TYPES.PatchNotesPublicPresenter)
    private readonly _patchNotesPresenter: PatchNotesPublicPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationLoadedEvent): boolean {
    return event.type === 'LocalizationLoadedEvent';
  }

  public async handleAsync(event: LocalizationLoadedEvent): Promise<void> {
    this._logger.info('[PatchNotesLocalizationLoadedEventHandler] Localization loaded event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the patch notes presenter with the loaded translations
    this._patchNotesPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[PatchNotesLocalizationLoadedEventHandler] Patch notes presenter labels updated');
  }
}

