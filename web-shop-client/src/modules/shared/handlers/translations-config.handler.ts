import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../infrastructure/events/events-handler.plugin';
import { TranslationsConfigEvent } from '../../localization/domain/events/translations-config.event';
import { ROOT_TYPES } from '../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../application/ports/logger.port';


@injectable()
export abstract class TranslationsConfigHandler implements IAsyncEventHandler<TranslationsConfigEvent> {
  constructor(
    @inject(ROOT_TYPES.Logger)
    protected readonly _logger: Logger
  ) {}

  public canHandle(event: TranslationsConfigEvent): boolean {
    return event.type === 'TranslationsConfigEvent';
  }

  public async handleAsync(event: TranslationsConfigEvent): Promise<void> {
    this._logger.info(`[TranslationsConfigHandler] Received translations config`, {
      languageCode: event.languageCode.value,
      direction: event.direction.value,
      translationsCount: Object.keys(event.translations).length
    });

        await this.onTranslationsConfig(event.translations, event.languageCode.value, event.direction.value);
  }

  protected abstract onTranslationsConfig(
    translations: Record<string, string>,
    languageCode: string,
    direction: 'ltr' | 'rtl'
  ): Promise<void>;
}

