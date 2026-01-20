import { injectable, inject } from 'inversify';
import { TranslationsConfigHandler } from '../../../shared/handlers/translations-config.handler';
import { APP_LAYOUT_TYPES } from '../../infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class AppLayoutTranslationsConfigHandler extends TranslationsConfigHandler {
  constructor(
    @inject(ROOT_TYPES.Logger)
    logger: Logger,
    @inject(APP_LAYOUT_TYPES.SidebarRendererPresenter)
    private readonly _sidebarPresenter: SidebarRendererPresenter
  ) {
    super(logger);
      }

  protected async onTranslationsConfig(
    translations: Record<string, string>,
    languageCode: string,
    direction: 'ltr' | 'rtl'
  ): Promise<void> {
    console.log('[AppLayoutTranslationsConfigHandler] Received translations config', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length,
      navKeys: Object.keys(translations).filter(key => key.startsWith('nav.'))
    });

                this._sidebarPresenter.onTranslationsConfig(translations, languageCode, direction);

      }
}
