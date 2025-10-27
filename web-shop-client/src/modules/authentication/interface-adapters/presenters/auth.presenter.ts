/**
 * Presenter для Authentication
 * Result → ViewModel + State Management
 * @injectable - регистрируется в DI!
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { AppUser } from '../../domain/types';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { AuthViewModel } from '../view-models/auth.view-model';
import { AuthUIViewModel } from '../view-models/auth-ui.view-model';
import { ValidateAppLoginUseCase } from '../../application/use-cases/validate-app-login.use-case';
import { LoadAuthUIConfigUseCase } from '../../application/use-cases/load-auth-ui-config.use-case';
import { AuthUIConfigValueObject } from '../../domain/value-objects/auth-ui-config.value-object';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class AuthPresenter {
	private _isAuthenticated: boolean = false;
	private _currentUser: AppUser | null = null;

	constructor(
		@inject(AUTH_TYPES.ValidateAppLoginUseCase)
		private readonly _validateAppLoginUseCase: ValidateAppLoginUseCase,
		@inject(AUTH_TYPES.LoadAuthUIConfigUseCase)
		private readonly _loadAuthUIConfigUseCase: LoadAuthUIConfigUseCase
	) { }
	/**
	 * Преобразование AppUser в ViewModel
	 */
	public present(user: AppUser): AuthViewModel {
		// Обновляем состояние при успешной авторизации
		this._isAuthenticated = true;
		this._currentUser = user;
		
		console.log('[AuthPresenter] present - Authentication state updated:', {
			isAuthenticated: this._isAuthenticated,
			currentUser: this._currentUser
		});
		
		// Генерируем событие для уведомления UI компонентов
		if (typeof window !== 'undefined') {
			const event = new CustomEvent('authStateChanged', { 
				detail: { isAuthenticated: true, user } 
			});
			console.log('[AuthPresenter] present - dispatching authStateChanged event:', event.detail);
			window.dispatchEvent(event);
			console.log('[AuthPresenter] present - authStateChanged event dispatched successfully');
		} else {
			console.log('[AuthPresenter] present - window is undefined, cannot dispatch event');
		}

		return {
			status: 'success',
			user: user,
			error: undefined
		};
	}

	/**
	 * Состояние загрузки
	 */
	public presentLoading(): AuthViewModel {
		return {
			status: 'loading',
			user: undefined,
			error: undefined
		};
	}

	/**
	 * Начальное состояние
	 */
	public presentIdle(): AuthViewModel {
		return {
			status: 'idle',
			user: undefined,
			error: undefined
		};
	}

	/**
	 * Методы для управления состоянием авторизации
	 */

	/**
	 * Проверка авторизации
	 */
	public isUserAuthenticated(): boolean {
		console.log('[AuthPresenter] isUserAuthenticated called:', { 
			isAuthenticated: this._isAuthenticated,
			currentUser: this._currentUser,
			timestamp: new Date().toISOString()
		});
		return this._isAuthenticated;
	}

	/**
	 * Получение текущего пользователя
	 */
	public getCurrentUser(): AppUser | null {
		return this._currentUser;
	}

	/**
	 * Установка состояния авторизации (вызывается из обработчика)
	 */
	public setAuthenticated(user: AppUser): void {
		console.log('[AuthPresenter] setAuthenticated called with user:', user);
		this._isAuthenticated = true;
		this._currentUser = user;
		console.log('[AuthPresenter] Authentication state updated:', {
			isAuthenticated: this._isAuthenticated,
			currentUser: this._currentUser
		});
		
		// Генерируем событие для уведомления UI компонентов
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('authStateChanged', { 
				detail: { isAuthenticated: true, user } 
			}));
		}
	}

	/**
	 * Сброс состояния авторизации
	 */
	public setUnauthenticated(): void {
		this._isAuthenticated = false;
		this._currentUser = null;
		
		// Генерируем событие для уведомления UI компонентов
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('authStateChanged', { 
				detail: { isAuthenticated: false, user: null } 
			}));
		}
	}

	/**
	 * Показать AuthPopup (вызывается из event handler)
	 * Используется когда пользователь пытается выполнить действие требующее авторизации
	 */
	public showAuthPopup(): void {
		console.log('[AuthPresenter] Showing auth popup');
		
		// Генерируем CustomEvent для AuthModule
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('showAuthPopup', { 
				detail: { reason: 'authentication_required' } 
			}));
		}
	}

	/**
	 * Получение ViewModel с текущим состоянием
	 */
	public getCurrentViewModel(): AuthViewModel {
		if (this._isAuthenticated && this._currentUser) {
			return {
				status: 'success',
				user: this._currentUser,
				error: undefined
			};
		}

		return this.presentIdle();
	}

	/**
	 * Инициализация авторизации через UseCase
	 */
	public async initializeAuthentication(appId: string, userId?: string): Promise<AuthViewModel> {
		console.log('[AuthPresenter] initializeAuthentication called', { appId, userId });
		const result = await this._validateAppLoginUseCase.execute({ appId, userId });
		
		console.log('[AuthPresenter] initializeAuthentication result', result);
		if (result.isSuccess()) {
			console.log('[AuthPresenter] initializeAuthentication success, calling present with user:', result.data);
			return this.present(result.data);
		}
		
		// При ошибке сбрасываем состояние
		this._isAuthenticated = false;
		this._currentUser = null;
		
		return {
			status: 'error',
			user: undefined,
			error: result.error?.message || 'Authentication failed'
		};
	}

	/**
	 * Методы для работы с UI конфигурацией
	 */

	/**
	 * Загрузка UI конфигурации
	 */
	public async loadAuthUI(): Promise<AuthUIViewModel> {
		try {
			console.log('[AuthPresenter] Loading auth UI config...');
			
			const result = await this._loadAuthUIConfigUseCase.execute();
			
			console.log('[AuthPresenter] UseCase result:', result);
			
			if (result.isFailure()) {
				console.error('[AuthPresenter] UseCase failed:', result.error);
				return {
					status: 'error',
					error: result.error?.message || 'Failed to load auth UI config'
				};
			}

			console.log('[AuthPresenter] UseCase success, config:', result.data);
			console.log('[AuthPresenter] Config keys:', Object.keys(result.data || {}));
			console.log('[AuthPresenter] loginButton exists:', !!result.data?.loginButton);

			return {
				status: 'success',
				config: result.data!,
				isAuthenticated: this._isAuthenticated,
				showLoginButton: !this._isAuthenticated,
				showLoginPopup: false
			};
		} catch (error) {
			console.error('[AuthPresenter] Exception:', error);
			return {
				status: 'error',
				error: String(error)
			};
		}
	}

	/**
	 * Представление UI состояния
	 */
	public presentAuthUI(
		config: AuthUIConfigValueObject, 
		showPopup: boolean = false
	): AuthUIViewModel {
		const showLoginButton = !this._isAuthenticated;

		return {
			status: 'success',
			config,
			isAuthenticated: this._isAuthenticated,
			showLoginButton,
			showLoginPopup: showPopup
		};
	}

	/**
	 * Состояние загрузки UI
	 */
	public presentUILoading(): AuthUIViewModel {
		return {
			status: 'loading'
		};
	}

	/**
	 * Состояние ошибки UI
	 */
	public presentUIError(error: string): AuthUIViewModel {
		return {
			status: 'error',
			error
		};
	}
}
