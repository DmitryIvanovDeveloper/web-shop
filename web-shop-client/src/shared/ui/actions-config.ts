/**
 * ActionsConfig - конфигурация обработчиков событий
 * Discriminated union для типобезопасности
 */

export type ActionConfig =
	| { readonly type: 'loadPopup'; readonly config: string }
	| { readonly type: 'navigate'; readonly url: string }
	| { readonly type: 'custom'; readonly handler: string; readonly params?: Record<string, unknown> }
	| { readonly type: 'event'; readonly eventName: string; readonly payload?: Record<string, unknown> };

export interface ActionsConfig {
	readonly onClick?: ActionConfig;
	readonly onChange?: ActionConfig;
	readonly onSubmit?: ActionConfig;
	readonly onFocus?: ActionConfig;
	readonly onBlur?: ActionConfig;
}


