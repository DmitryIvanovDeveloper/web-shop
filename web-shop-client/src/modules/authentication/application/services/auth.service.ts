

import { injectable, inject } from 'inversify';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../../interface-adapters/presenters/auth.presenter';


export interface AuthenticatedUserInfo {
  readonly userId: string;
  readonly appId: string;
  readonly username: string;
}

export interface AuthServicePort {
  isUserAuthenticated(): boolean;
  getCurrentUserId(): string | null;
  getCurrentUser(): AuthenticatedUserInfo | null;
}


@injectable()
export class AuthService implements AuthServicePort {
  constructor(
    @inject(AUTH_TYPES.AuthPresenter)
    private readonly _authPresenter: AuthPresenter
  ) {}

  
  public isUserAuthenticated(): boolean {
    return this._authPresenter.isUserAuthenticated();
  }

  
  public getCurrentUserId(): string | null {
    const user = this._authPresenter.getCurrentUser();
    return user?.userId || null;
  }

  public getCurrentUser(): AuthenticatedUserInfo | null {
    const user = this._authPresenter.getCurrentUser();
    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      appId: user.appId,
      username: user.username,
    };
  }
}



