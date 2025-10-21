import { Result } from '../../../../shared/domain/result/result';
import { AuthUIConfig, AuthButtonConfig, AuthPopupConfig } from '../types';

export class AuthUIConfigValueObject {
  private constructor(
    public readonly version: string,
    public readonly loginButton: AuthButtonConfig,
    public readonly loginPopup: AuthPopupConfig
  ) {
    Object.freeze(this);
  }

  public static create(
    version: string,
    loginButton: AuthButtonConfig,
    loginPopup: AuthPopupConfig
  ): Result<AuthUIConfigValueObject, Error> {
    if (!version || typeof version !== 'string') {
      return Result.error(new Error('Version is required and must be a string'));
    }

    if (!loginButton || typeof loginButton !== 'object') {
      return Result.error(new Error('LoginButton config is required'));
    }

    if (!loginButton.text || typeof loginButton.text !== 'string') {
      return Result.error(new Error('LoginButton text is required'));
    }

    if (!loginPopup || typeof loginPopup !== 'object') {
      return Result.error(new Error('LoginPopup config is required'));
    }

    if (!loginPopup.theme || !loginPopup.layout) {
      return Result.error(new Error('LoginPopup theme and layout are required'));
    }

    const config = new AuthUIConfigValueObject(version, loginButton, loginPopup);
    return Result.ok(config);
  }

  public equals(other: AuthUIConfigValueObject): boolean {
    if (!other) return false;
    
    return (
      this.version === other.version &&
      this.loginButton.text === other.loginButton.text &&
      JSON.stringify(this.loginButton.styles) === JSON.stringify(other.loginButton.styles) &&
      JSON.stringify(this.loginPopup) === JSON.stringify(other.loginPopup)
    );
  }

  public toJSON(): AuthUIConfig {
    return {
      version: this.version,
      loginButton: this.loginButton,
      loginPopup: this.loginPopup
    };
  }
}
