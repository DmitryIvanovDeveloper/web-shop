import type { AuthUIConfigValueObject } from '../../domain/value-objects/auth-ui-config.value-object';

export type AuthUIViewModel =
  | { readonly status: 'loading' }
  | { 
      readonly status: 'success'; 
      readonly config: AuthUIConfigValueObject; 
      readonly isAuthenticated: boolean;
      readonly showLoginButton: boolean;
      readonly showLoginPopup: boolean;
    }
  | { readonly status: 'error'; readonly error: string };