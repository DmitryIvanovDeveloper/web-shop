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
    console.log('[AppLayoutTranslationsConfigHandler] Created with sidebar presenter:', !!this._sidebarPresenter);
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

    // Pass translations config to sidebar presenter for button text updates
    // Note: Currently sidebar buttons are hardcoded, but this provides infrastructure
    // for future dynamic translation of sidebar elements
    this._sidebarPresenter.onTranslationsConfig(translations, languageCode, direction);

    console.log('[AppLayoutTranslationsConfigHandler] Translations config passed to sidebar presenter');
  }
}
