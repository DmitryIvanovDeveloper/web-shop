

import type { AuthenticatedUserInfo } from '../../../authentication/application/services';

export interface AuthServicePort {
  
  isUserAuthenticated(): boolean;
  
  
  getCurrentUserId(): string | null;

  
  getCurrentUser(): AuthenticatedUserInfo | null;
}


