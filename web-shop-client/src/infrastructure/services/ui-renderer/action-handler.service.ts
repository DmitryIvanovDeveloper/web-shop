

import { injectable } from 'inversify';
import type { ActionConfig, ActionContext } from '../../../shared/ui';

@injectable()
export class UIActionHandler {
	
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
									if (context.navigate && typeof context.navigate === 'function') {
												context.navigate(action.url);
			} else if (typeof window !== 'undefined') {
												window.location.href = action.url;
			} else {
							}
		}
	}
}
