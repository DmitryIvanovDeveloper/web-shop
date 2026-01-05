import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LanguageChangedEvent } from '../../domain/events/language-changed.event';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class LanguageChangedHandler implements IAsyncEventHandler<LanguageChangedEvent> {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LanguageChangedEvent): boolean {
    return event.type === 'localization.language.changed';
  }

  public async handleAsync(event: LanguageChangedEvent): Promise<void> {
    this._logger.info('[LanguageChangedHandler] Language changed event received', {
      languageCode: event.languageCode.value,
      direction: event.direction.value
    });

    // This handler can be extended by modules that need to react to language changes
    // For example, updating cached translations, reloading data, etc.

    // Apply direction to document if not already done by the presenter
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dir = event.direction.value;
      document.documentElement.lang = event.languageCode.value;
      this._logger.debug('[LanguageChangedHandler] Applied language settings to document', {
        lang: event.languageCode.value,
        dir: event.direction.value
      });
    }
  }
}