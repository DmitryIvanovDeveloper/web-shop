'use client';

import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { Logger } from '../../application/ports/logger.port';
import { ROOT_TYPES } from '../bootstrap/types';
import type { AppConfig } from '../../shared/config/app-config.types';

@injectable()
export class ApplyBackgroundOnConfigHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: AppConfigLoadedEvent): boolean {
    return event instanceof AppConfigLoadedEvent;
  }

  public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
    this._logger.info('[ApplyBackgroundOnConfigHandler] Processing AppConfigLoadedEvent');

    if (typeof window === 'undefined') {
      this._logger.debug('[ApplyBackgroundOnConfigHandler] Skipping (server environment)');
      return;
    }

    try {
      const config = event.config as AppConfig;
      const background = config?.theme?.background;
      const bodyStyle = document.body.style;

      bodyStyle.backgroundColor = background?.backgroundColor ?? '';
      bodyStyle.backgroundImage = background?.backgroundImage ?? '';
      bodyStyle.backgroundSize = background?.backgroundSize ?? '';
      bodyStyle.backgroundPosition = background?.backgroundPosition ?? '';
      bodyStyle.backgroundRepeat = background?.backgroundRepeat ?? '';
      bodyStyle.backgroundAttachment = background?.backgroundAttachment ?? '';

      if (background?.backgroundImage) {
        bodyStyle.minHeight = '100vh';
      } else {
        bodyStyle.removeProperty('min-height');
      }

      this._logger.info('[ApplyBackgroundOnConfigHandler] Body background styles applied');
    } catch (error) {
      this._logger.error('[ApplyBackgroundOnConfigHandler] Failed to apply body background', error);
    }
  }
}













