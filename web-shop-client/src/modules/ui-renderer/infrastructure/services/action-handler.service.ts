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
      // Check if we're in UI Builder preview mode
      const isUIBuilderMode = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).get('uibuilder') === 'true' ||
        new URLSearchParams(window.location.search).get('previewMode') === 'true'
      );
      
      // If in UI Builder mode, prevent navigation to avoid iframe reload
      // The parent window (UI Builder) will handle page switching via postMessage
      if (isUIBuilderMode) {
        console.log('[ActionHandler] In UI Builder mode, preventing navigation to avoid iframe reload', { url: action.url });
        // Extract pageSlug and notify parent if needed
        const pageSlug = action.url.startsWith('/') ? action.url.slice(1).split('?')[0].split('#')[0] : action.url.split('?')[0].split('#')[0];
        if (pageSlug && window.parent && window.parent !== window) {
          console.log('[ActionHandler] Notifying parent about page navigation request', { pageSlug });
          // Parent already knows about page switch, so we just prevent navigation
        }
        return; // Prevent navigation in UI Builder mode
      }
      
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
        // Для handleAppIdChange и changeLanguage передаем значение, для других - mock событие
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
        console.error('[ActionHandler] Handler not found in context:', action.handler);
        console.log('[ActionHandler] Available context keys:', Object.keys(context));
      }
    }
  }
}