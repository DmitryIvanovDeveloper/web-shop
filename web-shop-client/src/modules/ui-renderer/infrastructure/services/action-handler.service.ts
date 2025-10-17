import { injectable, inject } from 'inversify';
import type { ActionConfig, ActionContext } from '../../domain/types';
import type { LoadPageConfigUseCase } from '../../application/use-cases/load-page-config.use-case';
import { UI_RENDERER_TYPES } from '../bootstrap/types';

@injectable()
export class ActionHandler {
  constructor(
    @inject(UI_RENDERER_TYPES.LoadPageConfigUseCase)
    private readonly _loadConfigUseCase: LoadPageConfigUseCase
  ) {}

  public async handleAction(
    action: ActionConfig,
    context: ActionContext
  ): Promise<void> {
    console.log('[ActionHandler] Handling action:', action);
    
    if (action.type === 'loadPopup') {
      console.log('[ActionHandler] Loading popup config:', action.config);
      const result = await this._loadConfigUseCase.execute({
        pageType: action.config,
      });
      
      console.log('[ActionHandler] Popup config result:', result);
      console.log('[ActionHandler] Result isSuccess:', result.isSuccess());
      console.log('[ActionHandler] Result data:', result.data);
      console.log('[ActionHandler] Context onPopupOpen exists:', !!context.onPopupOpen);
      
      if (result.isSuccess() && context.onPopupOpen) {
        console.log('[ActionHandler] Opening popup with data:', result.data);
        context.onPopupOpen(result.data);
      } else {
        console.error('[ActionHandler] Failed to load popup config or onPopupOpen not provided');
        console.error('[ActionHandler] Reason - isSuccess:', result.isSuccess(), 'onPopupOpen:', !!context.onPopupOpen);
        if (!result.isSuccess()) {
          console.error('[ActionHandler] Error details:', result.error);
        }
      }
    }
    
    if (action.type === 'navigate') {
      window.location.href = action.url;
    }
    
    // custom handler можно добавить позже
  }
}