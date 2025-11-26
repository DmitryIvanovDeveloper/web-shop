/**
 * UI Action Handler Service
 * Универсальный сервис для обработки действий пользователя
 */

import { injectable } from 'inversify';
import type { ActionConfig, ActionContext } from '../../../shared/ui';

@injectable()
export class UIActionHandler {
	/**
	 * Обрабатывает действие пользователя
	 */
	public handleAction(
		action: ActionConfig,
		context: ActionContext,
		value?: string | number
	): void {
		console.log('[UIActionHandler] handleAction called', {
			actionType: action.type,
			actionUrl: (action as any).url,
			hasNavigate: !!context.navigate,
			navigateType: typeof context.navigate
		});
		
		if (action.type === 'custom' && action.handler) {
			const handler = context[action.handler];
			if (typeof handler === 'function') {
				if (value !== undefined) {
					handler(value);
				} else {
					handler();
				}
			}
		} else if (action.type === 'navigate' && action.url) {
			console.log('[UIActionHandler] Handling navigate action', {
				url: action.url,
				hasNavigate: !!context.navigate,
				navigateType: typeof context.navigate
			});
			
			// Handle navigation - prefer client-side navigation if available
			if (context.navigate && typeof context.navigate === 'function') {
				console.log('[UIActionHandler] Calling context.navigate', { url: action.url });
				// Use client-side navigation via Next.js router
				context.navigate(action.url);
			} else if (typeof window !== 'undefined') {
				console.log('[UIActionHandler] Falling back to window.location.href', { url: action.url });
				// Fallback to full page reload
				window.location.href = action.url;
			} else {
				console.warn('[UIActionHandler] No navigation method available', { url: action.url });
			}
		}
	}
}

