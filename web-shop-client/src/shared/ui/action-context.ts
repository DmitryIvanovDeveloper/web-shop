/**
 * ActionContext - контекст для обработки действий
 * Передаётся модулем в UI Renderer Service
 */

export interface SelectOption {
	readonly value: string;
	readonly label: string;
}

export interface ActionContext {
	// Standard handlers (handled by service)
	readonly onPopupOpen?: (config: unknown) => void;
	readonly onPopupClose?: () => void;
	readonly navigate?: (url: string) => void;

	// Localization handlers
	readonly availableLanguages?: SelectOption[];
	readonly changeLanguage?: (languageCode: string) => void;

	// Module-specific handlers (custom)
	readonly [key: string]: ((value?: unknown) => void) | ((event?: unknown) => void) | unknown;

	// State
	readonly isLoading?: boolean;
}


