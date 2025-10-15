// Типобезопасные типы для стилей
export type CSSValue = string | number;
export type SpacingValue = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4;
export type ColorKey = 'primary' | 'background' | 'surface' | 'text';

export interface StyleConfig {
  readonly padding?: SpacingValue;
  readonly backgroundColor?: ColorKey;
  readonly textColor?: ColorKey;
}

// Типобезопасные типы для пропсов компонентов
export interface ButtonProps {
  readonly text?: string;
  readonly icon?: string;
  readonly fullWidth?: boolean;
}

export interface ContainerProps {
  readonly vertical?: boolean;
}

// Discriminated union для всех возможных пропсов
export type ComponentProps =
  | { readonly type: 'Button'; readonly props: ButtonProps }
  | { readonly type: 'Container'; readonly props: ContainerProps };

// DTO для JSON
export interface ComponentNodeDTO {
  readonly id: string;
  readonly type: string;
  readonly props?: Record<string, unknown>;
  readonly styles?: Record<string, unknown>;
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

