

import { AppUser } from '../../domain/types';
import type { AuthLabels } from '../../../../shared/config/app-config.types';

export interface AuthViewModel {
  status: 'idle' | 'loading' | 'success' | 'error';
  user?: AppUser;
  error?: string;
  labels: AuthLabels;
}
