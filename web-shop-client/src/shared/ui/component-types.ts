/**
 * Component Types - каталог доступных UI компонентов
 * Type-safe константы для использования в модулях
 */

export const UIComponents = {
	// Layout Components
	Container: 'Container',
	Grid: 'Grid',
	DataGrid: 'DataGrid',
	
	// Atom Components
	Button: 'Button',
	Text: 'Text',
	Input: 'Input',
	InputText: 'InputText',
	Image: 'Image',
	Badge: 'Badge',
	
	// Molecule Components
	UniversalInput: 'UniversalInput',
	OfferCard: 'OfferCard',
	Popup: 'Popup',
	
	// Module-specific Components
	OffersList: 'OffersList',
	ProductsList: 'ProductsList',
} as const;

export type UIComponentType = typeof UIComponents[keyof typeof UIComponents];


