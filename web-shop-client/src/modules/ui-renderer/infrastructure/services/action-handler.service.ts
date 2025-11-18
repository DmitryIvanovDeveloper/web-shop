import { injectable } from 'inversify';
import type { ActionConfig, ActionContext } from '../../domain/types';

@injectable()
export class ActionHandler {
  public async handleAction(
    action: ActionConfig,
    context: ActionContext,
    value?: any
  ): Promise<void> {
    if (action.type === 'navigate' && action.url) {
      // Handle navigation - prefer client-side navigation if available
      if (context.navigate && typeof context.navigate === 'function') {
        // Use client-side navigation via Next.js router
        context.navigate(action.url);
      } else if (typeof window !== 'undefined') {
        // Fallback to full page reload
        window.location.href = action.url;
      }
      return;
    }
    
    if (action.type === 'custom' && action.handler) {
      // Ищем обработчик в контексте по имени
      const handler = (context as any)[action.handler];
      if (typeof handler === 'function') {
        // Для handleAppIdChange передаем значение, для других - mock событие
        if (action.handler === 'handleAppIdChange') {
          handler(value || '');
        } else {
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