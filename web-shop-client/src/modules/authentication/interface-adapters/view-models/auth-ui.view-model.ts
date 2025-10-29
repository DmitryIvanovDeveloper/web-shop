/**
 * Auth UI ViewModel
 * DEPRECATED: This file is kept for backward compatibility only.
 * New implementation uses UIDescriptor from presenter.createAuthPopupUI()
 */

export type AuthUIViewModel =
	| {
			readonly status: 'loading';
	  }
	| {
			readonly status: 'error';
			readonly error: string;
	  }
	| {
			readonly status: 'success';
			readonly config: any; // Deprecated
			readonly isAuthenticated: boolean;
			readonly showLoginButton: boolean;
			readonly showLoginPopup: boolean;
	  };
