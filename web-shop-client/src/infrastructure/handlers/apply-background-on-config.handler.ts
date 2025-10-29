import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { Logger } from '../../application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '../bootstrap/types';

@injectable()
export class ApplyBackgroundOnConfigHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
  ) {}

  public canHandle(event: AppConfigLoadedEvent): boolean {
    return event instanceof AppConfigLoadedEvent;
  }

  public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
    try {
      const bg = event.payload.config.background;
      if (typeof document === 'undefined' || !bg) return;

      const bodyStyle = document.body.style as CSSStyleDeclaration;
      if (bg.backgroundImage !== undefined) bodyStyle.backgroundImage = bg.backgroundImage;
      if (bg.backgroundSize !== undefined) bodyStyle.backgroundSize = bg.backgroundSize as any;
      if (bg.backgroundPosition !== undefined) bodyStyle.backgroundPosition = bg.backgroundPosition as any;
      if (bg.backgroundRepeat !== undefined) bodyStyle.backgroundRepeat = bg.backgroundRepeat as any;
      if (bg.backgroundAttachment !== undefined) bodyStyle.backgroundAttachment = bg.backgroundAttachment as any;
      if (bg.backgroundColor !== undefined) bodyStyle.backgroundColor = bg.backgroundColor as any;

      this._logger.info('[ApplyBackgroundOnConfigHandler] Applied global background styles to <body>');
    } catch (error) {
      this._logger.error('[ApplyBackgroundOnConfigHandler] Failed to apply global background', error);
    }
  }
}



