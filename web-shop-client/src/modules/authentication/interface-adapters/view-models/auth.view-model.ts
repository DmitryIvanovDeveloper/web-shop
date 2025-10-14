/**
 * ViewModel для Authentication
 * Изменяемые свойства (НЕ readonly)
 */

import { AppUser } from '../../domain/types';

export interface AuthViewModel {
  status: 'idle' | 'loading' | 'success' | 'error';
  user?: AppUser;
  error?: string;
}
