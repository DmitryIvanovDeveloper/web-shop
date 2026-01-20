

export const UIComponents = {
		Container: 'Container',
	Grid: 'Grid',
	DataGrid: 'DataGrid',
	
		Button: 'Button',
	Text: 'Text',
	Input: 'Input',
	InputText: 'InputText',
	Image: 'Image',
	Badge: 'Badge',
	
		UniversalInput: 'UniversalInput',
	OfferCard: 'OfferCard',
	Popup: 'Popup',
	
		OffersList: 'OffersList',
	ProductsList: 'ProductsList',
} as const;

export type UIComponentType = typeof UIComponents[keyof typeof UIComponents];


