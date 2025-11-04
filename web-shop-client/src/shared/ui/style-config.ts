/**
 * StyleConfig - типобезопасная конфигурация стилей
 * Поддерживает Layout, Typography, Colors, Spacing, Position
 */

export type SpacingValue = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80;
export type ColorKey = 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'textSecondary' | 'success' | 'error' | 'warning' | 'border';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export interface StyleConfig {
	// Layout
	readonly display?: 'flex' | 'grid' | 'block' | 'inline' | 'inline-flex';
	readonly flexDirection?: 'row' | 'column';
	readonly justifyContent?: 'center' | 'space-between' | 'flex-start' | 'flex-end';
	readonly alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
	readonly flex?: number | string;
	readonly gap?: SpacingValue | string;
	
	// Grid
	readonly gridTemplateColumns?: string;
	readonly gridTemplateRows?: string;
	
	// Spacing
	readonly padding?: SpacingValue | string;
	readonly paddingX?: SpacingValue;
	readonly paddingY?: SpacingValue;
	readonly margin?: SpacingValue | string;
	readonly marginTop?: SpacingValue;
	readonly marginBottom?: SpacingValue;
	readonly marginLeft?: SpacingValue;
	readonly marginRight?: SpacingValue;
	
	// Colors
	readonly backgroundColor?: ColorKey | string;
	readonly textColor?: ColorKey | string;
	readonly borderColor?: ColorKey | string;
	
	// Typography
	readonly fontSize?: FontSize | string;
	readonly fontWeight?: FontWeight | number;
	readonly fontFamily?: string;
	readonly textAlign?: 'left' | 'center' | 'right' | 'justify';
	readonly textDecoration?: 'none' | 'line-through' | 'underline';
	readonly lineHeight?: number | string;
	readonly letterSpacing?: string;
	
	// Size
	readonly width?: number | string;
	readonly height?: number | string;
	readonly minWidth?: number | string;
	readonly minHeight?: number | string;
	readonly maxWidth?: number | string;
	readonly maxHeight?: number | string;
	
	// Position
	readonly position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
	readonly top?: SpacingValue | string;
	readonly left?: SpacingValue | string;
	readonly right?: SpacingValue | string;
	readonly bottom?: SpacingValue | string;
	readonly zIndex?: number;
	readonly transform?: string;
	
	// Visual
	readonly borderRadius?: SpacingValue | string;
	readonly border?: string;
	readonly borderWidth?: number | string;
	readonly borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
	readonly boxShadow?: string;
	readonly opacity?: number;
	
	// Background
	readonly backgroundImage?: string;
	readonly backgroundSize?: 'cover' | 'contain' | 'auto' | string;
	readonly backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | string;
	readonly backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
	
	// Overflow
	readonly overflow?: 'hidden' | 'visible' | 'scroll' | 'auto';
	readonly overflowX?: 'hidden' | 'visible' | 'scroll' | 'auto';
	readonly overflowY?: 'hidden' | 'visible' | 'scroll' | 'auto';
	
	// Other
	readonly objectFit?: 'contain' | 'cover' | 'fill' | 'none';
	readonly filter?: string;
	readonly cursor?: 'pointer' | 'default' | 'not-allowed' | 'grab';
	readonly pointerEvents?: 'auto' | 'none';
	
	// Custom CSS classes (Tailwind, etc.)
	readonly className?: string;
	
	// Loading state styles
	readonly loadingStyles?: Partial<StyleConfig>;
}


