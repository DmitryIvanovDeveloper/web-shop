// Типобезопасные типы для стилей
import type { CSSProperties } from 'react';

export type CSSValue = string | number;
export type SpacingValue = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80;
export type ColorKey = 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'textSecondary' | 'success' | 'error' | 'warning' | 'border';

export interface StyleConfig {
  // Layout
  readonly display?: 'flex' | 'grid' | 'block' | 'inline' | 'inline-flex';
  readonly flexDirection?: 'row' | 'column';
  readonly justifyContent?: 'center' | 'space-between' | 'flex-start' | 'flex-end';
  readonly alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
  readonly flex?: number | string;
  readonly gap?: SpacingValue;
  
  // Grid
  readonly gridTemplateColumns?: string;
  
  // Spacing
  readonly padding?: SpacingValue;
  readonly paddingX?: SpacingValue;
  readonly paddingY?: SpacingValue;
  readonly margin?: SpacingValue | string;
  readonly marginTop?: SpacingValue;
  readonly marginBottom?: SpacingValue;
  
  // Colors
  readonly backgroundColor?: ColorKey | string;
  readonly textColor?: ColorKey | string;
  
  // Typography
  readonly fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  readonly fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  readonly fontFamily?: string;
  readonly textAlign?: 'left' | 'center' | 'right';
  readonly textDecoration?: 'none' | 'line-through' | 'underline';
  
  // Custom CSS classes
  readonly className?: string;
  
  // Size
  readonly width?: number | string;
  readonly height?: number | string;
  readonly minHeight?: number | string;
  readonly maxWidth?: number | string;
  readonly maxHeight?: number | string;
  
  // Position
  readonly position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  readonly top?: SpacingValue;
  readonly left?: SpacingValue;
  readonly right?: SpacingValue;
  readonly bottom?: SpacingValue;
  readonly zIndex?: number;
  
  // Visual
  readonly borderRadius?: SpacingValue;
  readonly border?: string;
  
  // Background
  readonly backgroundImage?: string;
  readonly backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  readonly backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | string;
  readonly backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  readonly overflow?: 'hidden' | 'visible' | 'scroll';
  readonly objectFit?: 'contain' | 'cover';
  readonly filter?: string;
}

// Типобезопасные типы для пропсов компонентов
export interface ButtonProps {
  readonly text?: string;
  readonly icon?: string;
  readonly fullWidth?: boolean;
}

export interface ContainerProps {
  readonly vertical?: boolean;
  readonly sidebar?: boolean;
}

export interface BadgeProps {
  readonly text?: string;
  readonly variant?: 'discount' | 'limit' | 'timer' | 'rarity';
  readonly icon?: string;
}

export interface ImageProps {
  readonly src?: string;
  readonly alt?: string;
}

export interface TextProps {
  readonly text?: string;
}

export interface InputTextProps {
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
}

export interface UniversalInputProps {
  readonly error?: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly value?: string | number;
  readonly defaultValue?: string | number;
  readonly isRequired?: boolean;
  readonly disabled?: boolean;
  readonly type?: 'number' | 'password' | 'phone' | 'text' | 'email' | 'float';
  readonly bg?: 'primary' | 'secondary';
  readonly errorlink?: { title: string; path: string };
  readonly readonly?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: (value: string | number) => void;
  readonly onErrorLinkPress?: () => void;
}

export interface InputProps {
  readonly placeholder?: string;
  readonly value?: string | number;
  readonly onChange?: (value: string | number) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  readonly disabled?: boolean;
  readonly readonly?: boolean;
}

export interface GridProps {
  readonly columns?: number;
  readonly gap?: number;
}

export interface DataGridProps {
  readonly dataSource?: string;
  readonly columns?: number;
  readonly gap?: number;
}

export interface OfferCardProps {
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly includedItems?: string[];
  readonly discount?: string;
  readonly playerLimit?: string;
  readonly timer?: string;
  readonly title?: string;
  readonly rarity?: string;
  readonly originalPrice?: string;
  readonly currentPrice?: string;
  readonly rpBonus?: number;
  readonly lpBonus?: number;
}

export interface PopupProps {
  readonly isOpen?: boolean;
  readonly showCloseButton?: boolean;
}

export interface OffersListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

// Action types - discriminated union
export type ActionConfig =
  | { readonly type: 'loadPopup'; readonly config: string }
  | { readonly type: 'navigate'; readonly url: string }
  | { readonly type: 'custom'; readonly handler: string };

export interface ActionsConfig {
  readonly onClick?: ActionConfig;
}

// Универсальный интерфейс для всех компонентов
export interface ComponentProps {
  readonly type: string;
  readonly props: Record<string, any>;
}

// DTO для JSON
export interface ComponentNodeDTO {
  readonly id: string;
  readonly type: string;
  readonly props?: Record<string, unknown>;
  readonly styles?: Record<string, unknown>;
  readonly actions?: Record<string, unknown>;
  readonly children?: readonly ComponentNodeDTO[];
}

export interface ThemeDTO {
  readonly colors: Record<string, string>;
  readonly spacing: readonly number[];
}

export interface ConfigDTO {
  readonly version: string;
  readonly theme: ThemeDTO;
  readonly layout: ComponentNodeDTO;
}

export interface ActionContext {
  readonly onPopupOpen?: (config: any) => void;
  readonly onPopupClose?: () => void;
  readonly handleAuthSubmit?: (e: React.FormEvent) => void;
  readonly handleAppIdChange?: (value: string) => void;
  readonly onLoginClick?: () => void;
}

