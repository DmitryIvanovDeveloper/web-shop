import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { AuthUIRepositoryPort } from '../../application/ports/auth-ui-repository.port';
import { AuthUIConfigValueObject } from '../../domain/value-objects/auth-ui-config.value-object';
import { AuthUIConfig, AuthButtonConfig, AuthPopupConfig } from '../../domain/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { AUTH_TYPES } from '../bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class AuthUIRepository implements AuthUIRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async loadAuthUIConfig(): Promise<Result<AuthUIConfigValueObject, Error>> {
    try {
      console.log('[AuthUIRepository] Loading auth UI config...');
      
      // Загружаем конфигурацию через HttpClient
      const response = await this._httpClient.get<AuthUIConfig>('/api/authentication/ui-config');
      
      console.log('[AuthUIRepository] HTTP response:', response);
      
      if (!response.data) {
        console.error('[AuthUIRepository] No data received from API');
        return Result.error(new Error('Failed to load auth UI config: no data received'));
      }

      console.log('[AuthUIRepository] Data received:', response.data);

      // Runtime валидация
      if (!this._isValidAuthUIConfig(response.data)) {
        console.error('[AuthUIRepository] Invalid config format:', response.data);
        return Result.error(new Error('Invalid auth UI config format'));
      }

      // Извлекаем конфигурацию кнопки
      const loginButtonConfig = this._extractButtonConfig(response.data.loginButton);
      if (!loginButtonConfig) {
        return Result.error(new Error('Invalid login button configuration'));
      }

      // Извлекаем конфигурацию popup
      const loginPopupConfig = this._extractPopupConfig(response.data.loginPopup);
      if (!loginPopupConfig) {
        return Result.error(new Error('Invalid login popup configuration'));
      }

      // Создаем Value Object
      const result = AuthUIConfigValueObject.create(
        response.data.version,
        loginButtonConfig as any,
        loginPopupConfig as any
      );

      if (result.isFailure()) {
        return Result.error(result.error);
      }

      this._logger.info('[AuthUIRepository] Auth UI config loaded successfully');
      return Result.ok(result.data!);

    } catch (error) {
      this._logger.error('[AuthUIRepository] Error loading auth UI config:', error);
      return Result.error(new Error(`Failed to load auth UI config: ${error}`));
    }
  }

  private _isValidAuthUIConfig(data: unknown): data is AuthUIConfig {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;
    
    return (
      typeof obj.version === 'string' &&
      this._isValidButtonConfig(obj.loginButton) &&
      this._isValidPopupConfig(obj.loginPopup)
    );
  }

  private _isValidButtonConfig(data: unknown): data is AuthButtonConfig {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;
    
    return (
      typeof obj.text === 'string' &&
      typeof obj.styles === 'object' &&
      obj.styles !== null &&
      typeof obj.layout === 'object' &&
      obj.layout !== null &&
      typeof obj.theme === 'object' &&
      obj.theme !== null
    );
  }

  private _isValidPopupConfig(data: unknown): data is AuthPopupConfig {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;
    
    return (
      typeof obj.theme === 'object' &&
      obj.theme !== null &&
      typeof obj.layout === 'object' &&
      obj.layout !== null
    );
  }

  private _extractButtonConfig(rawConfig: AuthButtonConfig) {
    try {
      return {
        layout: this._extractButtonLayout(rawConfig.layout),
        theme: this._extractButtonTheme(rawConfig.theme),
        text: rawConfig.text,
        styles: this._extractButtonStyles(rawConfig.styles),
        position: rawConfig.position ? this._extractButtonPosition(rawConfig.position) : undefined,
        showWhenAuthenticated: rawConfig.showWhenAuthenticated ?? false
      };
    } catch (error) {
      return null;
    }
  }

  private _extractButtonStyles(rawStyles: Record<string, unknown>) {
    return {
      backgroundColor: typeof rawStyles.backgroundColor === 'string' ? rawStyles.backgroundColor : undefined,
      textColor: typeof rawStyles.textColor === 'string' ? rawStyles.textColor : undefined,
      padding: typeof rawStyles.padding === 'number' ? rawStyles.padding : undefined,
      borderRadius: typeof rawStyles.borderRadius === 'number' ? rawStyles.borderRadius : undefined,
      fontWeight: typeof rawStyles.fontWeight === 'string' ? rawStyles.fontWeight : undefined,
      fontSize: typeof rawStyles.fontSize === 'string' ? rawStyles.fontSize : undefined,
      height: typeof rawStyles.height === 'string' ? rawStyles.height : undefined,
      width: typeof rawStyles.width === 'string' ? rawStyles.width : undefined,
      fullWidth: typeof rawStyles.fullWidth === 'boolean' ? rawStyles.fullWidth : undefined
    };
  }

  private _extractButtonPosition(rawPosition: Record<string, unknown>) {
    return {
      fixed: typeof rawPosition.fixed === 'boolean' ? rawPosition.fixed : undefined,
      top: typeof rawPosition.top === 'string' ? rawPosition.top : undefined,
      right: typeof rawPosition.right === 'string' ? rawPosition.right : undefined,
      bottom: typeof rawPosition.bottom === 'string' ? rawPosition.bottom : undefined,
      left: typeof rawPosition.left === 'string' ? rawPosition.left : undefined,
      zIndex: typeof rawPosition.zIndex === 'number' ? rawPosition.zIndex : undefined
    };
  }

  private _extractButtonLayout(rawLayout: Record<string, unknown>) {
    return {
      id: typeof rawLayout.id === 'string' ? rawLayout.id : 'unknown',
      type: typeof rawLayout.type === 'string' ? rawLayout.type : 'unknown',
      props: {
        text: typeof rawLayout.props === 'object' && rawLayout.props ? 
          (rawLayout.props as any).text || 'Login' : 'Login',
        fullWidth: typeof rawLayout.props === 'object' && rawLayout.props ? 
          (rawLayout.props as any).fullWidth || true : true
      },
      styles: rawLayout.styles || {},
      actions: rawLayout.actions || {},
      children: Array.isArray(rawLayout.children) ? rawLayout.children as Record<string, unknown>[] : []
    };
  }

  private _extractButtonTheme(rawTheme: Record<string, unknown>) {
    return {
      colors: rawTheme.colors || {},
      spacing: Array.isArray(rawTheme.spacing) ? rawTheme.spacing as number[] : [],
      borderRadius: rawTheme.borderRadius || {},
      typography: rawTheme.typography || {}
    };
  }

  private _extractPopupConfig(rawConfig: AuthPopupConfig) {
    try {
      return {
        theme: this._extractPopupTheme(rawConfig.theme),
        layout: this._extractPopupLayout(rawConfig.layout)
      };
    } catch (error) {
      return null;
    }
  }

  private _extractPopupTheme(rawTheme: Record<string, unknown>) {
    if (!rawTheme.colors || typeof rawTheme.colors !== 'object') {
      throw new Error('Invalid theme colors');
    }

    return {
      colors: rawTheme.colors as Record<string, string>,
      spacing: Array.isArray(rawTheme.spacing) ? rawTheme.spacing as number[] : []
    };
  }

  private _extractPopupLayout(rawLayout: Record<string, unknown>) {
    return {
      id: typeof rawLayout.id === 'string' ? rawLayout.id : 'unknown',
      type: typeof rawLayout.type === 'string' ? rawLayout.type : 'unknown',
      props: rawLayout.props || {},
      styles: rawLayout.styles || {},
      children: Array.isArray(rawLayout.children) ? rawLayout.children as Record<string, unknown>[] : []
    };
  }
}
