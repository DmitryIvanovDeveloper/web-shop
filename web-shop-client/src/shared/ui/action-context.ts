

export interface SelectOption {
	readonly value: string;
	readonly label: string;
}

export interface ActionContext {
		readonly onPopupOpen?: (config: unknown) => void;
	readonly onPopupClose?: () => void;
	readonly navigate?: (url: string) => void;

		readonly availableLanguages?: SelectOption[];
	readonly changeLanguage?: (languageCode: string) => void;

		readonly [key: string]: ((value?: unknown) => void) | ((event?: unknown) => void) | unknown;

		readonly isLoading?: boolean;
}


