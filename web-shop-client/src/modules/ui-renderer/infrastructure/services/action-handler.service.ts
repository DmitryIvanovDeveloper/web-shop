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
    context: ActionContext,
    value?: any
  ): Promise<void> {
    
    if (action.type === 'loadPopup') {
      const result = await this._loadConfigUseCase.execute({
        pageType: action.config,
      });
      
      
      if (result.isSuccess() && context.onPopupOpen) {
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
    
    if (action.type === 'custom') {
      
      // Ищем обработчик в контексте по имени
      const handler = (context as any)[action.handler];
      if (typeof handler === 'function') {
        
        // Для handleAppIdChange передаем значение, для других - mock событие
        if (action.handler === 'handleAppIdChange') {
          // Для onChange событий передаем значение напрямую
          handler(value || '');
        } else {
          // Для других обработчиков (например, handleAuthSubmit) передаем mock событие
          const mockEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
            currentTarget: null,
            target: null
          };
          
          handler(mockEvent);
        }
      } else {
        console.error('[ActionHandler] Handler not found in context:', action.handler);
        console.log('[ActionHandler] Available context keys:', Object.keys(context));
      }
    }
  }
}