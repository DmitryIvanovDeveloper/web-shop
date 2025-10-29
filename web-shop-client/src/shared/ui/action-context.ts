/**
 * ActionContext - контекст для обработки действий
 * Передаётся модулем в UI Renderer Service
 */

export interface ActionContext {
	// Standard handlers (handled by service)
	readonly onPopupOpen?: (config: unknown) => void;
	readonly onPopupClose?: () => void;
	
	// Module-specific handlers (custom)
	readonly [key: string]: ((value?: unknown) => void) | ((event?: unknown) => void) | unknown;
	
	// State
	readonly isLoading?: boolean;
}


