

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
			readonly config: any; 			readonly isAuthenticated: boolean;
			readonly showLoginButton: boolean;
			readonly showLoginPopup: boolean;
	  };
