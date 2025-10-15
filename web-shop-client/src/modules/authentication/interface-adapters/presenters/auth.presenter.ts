/**
 * Presenter для Authentication
 * Result → ViewModel
 * @injectable - регистрируется в DI!
 */

import { injectable } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { AppUser } from '../../domain/types';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { AuthViewModel } from '../view-models/auth.view-model';

@injectable()
export class AuthPresenter {
  /**
   * Преобразование Result в ViewModel
   */
  present(result: Result<AppUser, AuthenticationError>): AuthViewModel {
    if (result.isSuccess()) {
      return {
        status: 'success',
        user: result.data,
        error: undefined
      };
    }
    
    if (result.isFailure()) {
      return {
        status: 'error',
        user: undefined,
        error: result.error.message
      };
    }
    
    return {
      status: 'error',
      user: undefined,
      error: 'Unknown error'
    };
  }

  /**
   * Состояние загрузки
   */
  presentLoading(): AuthViewModel {
    return {
      status: 'loading',
      user: undefined,
      error: undefined
    };
  }

  /**
   * Начальное состояние
   */
  presentIdle(): AuthViewModel {
    return {
      status: 'idle',
      user: undefined,
      error: undefined
    };
  }
}
