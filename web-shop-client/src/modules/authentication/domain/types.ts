/**
 * Domain Types для Authentication
 * Чистые бизнес-сущности без внешних зависимостей
 */

/**
 * Пользователь приложения
 */
export interface AppUser {
  readonly userId: string;
  readonly username: string;
  readonly appId: string;
}

/**
 * Запрос на валидацию App ID
 */
export interface ValidateAppLoginRequest {
  readonly appId: string;
  readonly userId?: string; // Опционально - если передан, проверяем/создаем в Supabase
}

/**
 * Конфигурация UI для авторизации
 */
export interface AuthUIConfig {
  readonly version: string;
  readonly loginButton: AuthButtonConfig;
  readonly loginPopup: AuthPopupConfig;
}

/**
 * Конфигурация кнопки Login
 */
export interface AuthButtonConfig {
  readonly layout: {
    readonly id: string;
    readonly type: string;
    readonly props: {
      readonly text: string;
      readonly fullWidth: boolean;
    };
    readonly styles: {
      readonly backgroundColor: string;
      readonly textColor: string;
      readonly padding: number;
      readonly borderRadius: number;
      readonly fontWeight: string;
      readonly fontSize: string;
      readonly height: string;
      readonly width: string;
      readonly border: string;
      readonly cursor: string;
      readonly transition: string;
      readonly textAlign: string;
    };
    readonly actions: {
      readonly onClick: {
        readonly type: string;
        readonly handler: string;
      };
    };
  };
  readonly theme: {
    readonly colors: {
      readonly primary: string;
      readonly background: string;
      readonly surface: string;
      readonly text: string;
      readonly textSecondary: string;
      readonly accent: string;
      readonly border: string;
      readonly success: string;
      readonly error: string;
      readonly warning: string;
    };
    readonly spacing: readonly number[];
    readonly borderRadius: {
      readonly small: number;
      readonly medium: number;
      readonly large: number;
    };
    readonly typography: {
      readonly fontFamily: string;
      readonly fontSizes: {
        readonly xs: string;
        readonly sm: string;
        readonly base: string;
        readonly lg: string;
        readonly xl: string;
        readonly "2xl": string;
      };
      readonly fontWeights: {
        readonly normal: number;
        readonly medium: number;
        readonly semibold: number;
        readonly bold: number;
      };
    };
  };
  readonly text: string;
  readonly icon?: string;
  readonly styles: {
    readonly backgroundColor: string;
    readonly textColor: string;
    readonly padding: number;
    readonly borderRadius: number;
    readonly fontWeight: string;
    readonly fontSize: string;
    readonly height: string;
    readonly width?: string;
    readonly border?: string;
    readonly cursor?: string;
    readonly transition?: string;
    readonly textAlign?: string;
  };
  readonly hoverStyles?: {
    readonly opacity?: number;
  };
  readonly activeStyles?: {
    readonly transform?: string;
  };
  readonly loadingStyles?: {
    readonly backgroundColor?: string;
    readonly textColor?: string;
    readonly cursor?: string;
    readonly opacity?: number;
  };
  readonly loadingText?: string;
  readonly position: {
    readonly fixed: boolean;
    readonly top: string;
    readonly right: string;
  };
  readonly showWhenAuthenticated: boolean;
}

/**
 * Конфигурация popup авторизации
 */
export interface AuthPopupConfig {
  readonly theme: {
    readonly colors: {
      readonly primary: string;
      readonly background: string;
      readonly surface: string;
      readonly text: string;
      readonly textSecondary: string;
    };
  };
  readonly layout: {
    readonly type: string;
    readonly id: string;
    readonly props: Record<string, unknown>;
    readonly styles: Record<string, unknown>;
    readonly children: unknown[];
  };
}