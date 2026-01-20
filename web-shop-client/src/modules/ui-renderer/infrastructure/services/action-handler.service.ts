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
            const isUIBuilderMode = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).get('uibuilder') === 'true' ||
        new URLSearchParams(window.location.search).get('previewMode') === 'true'
      );
      
                  if (isUIBuilderMode) {
                        const pageSlug = action.url.startsWith('/') ? action.url.slice(1).split('?')[0].split('#')[0] : action.url.split('?')[0].split('#')[0];
        if (pageSlug && window.parent && window.parent !== window) {
                            }
        return;       }
      
            if (context.navigate && typeof context.navigate === 'function') {
                context.navigate(action.url);
      } else if (typeof window !== 'undefined') {
                window.location.href = action.url;
      }
      return;
    }
    
    if (action.type === 'custom' && action.handler) {
      console.log('[ActionHandler] Handling custom action', {
        handler: action.handler,
        value: value,
        hasContext: !!context,
        contextKeys: context ? Object.keys(context) : []
      });
      
            const handler = (context as any)[action.handler];
      if (typeof handler === 'function') {
                        if (action.handler === 'handleAppIdChange' || action.handler === 'changeLanguage') {
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
                console.log('[ActionHandler] Available context keys:', Object.keys(context));
      }
    }
  }
}