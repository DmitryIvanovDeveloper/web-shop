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
			// Handle navigation
			if (typeof window !== 'undefined') {
				window.location.href = action.url;
			}
		}
	}
}

