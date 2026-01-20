import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { PatchNotesPublicPresenter } from '../presenters/patch-notes-public.presenter';

@injectable()
export class PatchNotesLocalizationChangedEventHandler implements IAsyncEventHandler<LocalizationChangedEvent> {
  constructor(
    @inject(PATCH_NOTES_TYPES.PatchNotesPublicPresenter)
    private readonly _patchNotesPresenter: PatchNotesPublicPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationChangedEvent): boolean {
    return event.type === 'LocalizationChangedEvent';
  }

  public async handleAsync(event: LocalizationChangedEvent): Promise<void> {
    this._logger.info('[PatchNotesLocalizationChangedEventHandler] Localization changed event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

        this._patchNotesPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[PatchNotesLocalizationChangedEventHandler] Patch notes presenter labels updated after language change');
  }
}

