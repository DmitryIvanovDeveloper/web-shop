
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
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import type { UIDescriptor } from '../../../../shared/ui/ui-descriptor';
import type { AuthenticationModuleConfig, GlobalTheme, AuthLabels, AuthSettings, LoginButtonUIConfig } from '../../../../shared/config/app-config.types';
import { UIComponents } from '../../../../shared/ui/component-types';

export interface AuthModuleConfig {
	readonly labels: AuthLabels;
	readonly settings: AuthSettings;
	readonly loginButtonUI: LoginButtonUIConfig;
	readonly theme: GlobalTheme;
}

@injectable()
export class AuthPresenter {
	private _isAuthenticated: boolean = false;
	private _currentUser: AppUser | null = null;
	private _config: AuthModuleConfig | null = null;

	public readonly labels = {
		loginButton: 'Login',
		logoutButton: 'Logout',
		appIdPlaceholder: 'Enter App ID',
		userIdPlaceholder: 'Enter User ID',
		submitButton: 'Submit',
		welcomeTitle: 'PG3D HUB',
		welcomeMessage: 'Welcome to',
		welcomeSubtitle: 'Pixel Gun 3D Hub',
		enterAppId: 'Enter your App ID',
		enterUserId: 'Enter your User ID',
		successMessage: 'Success!',
		loadingMessage: 'Loading...',
		errorMessage: 'Error',
		helpQuestion: 'Need help?',
		helpAnswer: 'Contact support',
		agreementText: 'I agree',
		privacyPolicy: 'Privacy Policy',
		termsOfService: 'Terms of Service',
		refundPolicy: 'Refund Policy'
	};

	constructor(
		@inject(AUTH_TYPES.ValidateAppLoginUseCase)
		private readonly _validateAppLoginUseCase: ValidateAppLoginUseCase
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
	 * DEPRECATED: Old methods kept for backward compatibility
	 * New implementation uses createAuthPopupUI() instead
	 */

	/**
	 * Set config from AppConfigLoadedEvent
	 */
	public setConfig(config: AuthModuleConfig): void {
		this._config = config;
		Object.assign(this.labels, config.labels);
	}

	/**
	 * Check if config is loaded and ready
	 */
	public isConfigReady(): boolean {
		return this._config !== null;
	}

	/**
	 * Create Login Button UI Descriptor
	 */
	public createLoginButtonUI(): UIDescriptor {
		if (!this._config) {
			throw new Error('Config not loaded. AppConfigLoadedEvent must be handled first.');
		}

		const buttonConfig = this._config.loginButtonUI;
		if (!buttonConfig) {
			throw new Error('loginButtonUI config not found in authentication module config');
		}

		const labels = this._config.labels;

		// Преобразуем GlobalTheme в ThemeConfig (минимальная версия для кнопки)
		const theme = {
			colors: this._config.theme.colors,
			spacing: this._config.theme.spacing,
		};

		return {
			theme,
			layout: {
				id: 'login-button',
				type: UIComponents.Button,
				props: {
					text: `${buttonConfig.icon} ${labels.loginButton}`,
				},
				styles: buttonConfig.styles as Record<string, any>,
				actions: {
					onClick: {
						type: 'custom',
						handler: 'handleLoginClick',
					},
				},
				children: [],
			},
			context: {},
		};
	}

	/**
	 * Create Auth Popup UI Descriptor
	 */
	public createAuthPopupUI(
		state: 'idle' | 'loading' | 'success' | 'error',
		appIdValue: string,
		userIdValue: string,
		errorMessage: string | null
	): UIDescriptor {
		if (!this._config) {
			throw new Error('Config not loaded. AppConfigLoadedEvent must be handled first.');
		}

		if (state === 'loading') {
			return this._createLoadingPopup();
		}

		if (state === 'success') {
			return this._createSuccessPopup();
		}

		if (state === 'error') {
			return this._createErrorPopup(errorMessage);
		}

		return this._createIdlePopup(appIdValue, userIdValue);
	}

	private _createIdlePopup(appIdValue: string, userIdValue: string): UIDescriptor {
		const { labels } = this._config!;
		const theme = this._config!.theme;

		return {
			layout: {
				id: 'auth-popup-root',
				type: UIComponents.Popup,
				props: {
					isOpen: true,
					showCloseButton: true
				},
				styles: {
					backgroundColor: 'surface',
					padding: 8,
					borderRadius: 12,
					width: '480px',
					maxWidth: '90vw'
				},
				children: [
					{
						id: 'logo-section',
						type: UIComponents.Container,
						props: { vertical: true },
						styles: {
							textAlign: 'center',
							marginBottom: 4
						},
						children: [
							{
								id: 'logo-title',
								type: UIComponents.Text,
								props: { text: labels.welcomeTitle },
								styles: {
									fontSize: '4xl',
									fontWeight: 'bold',
									textColor: 'secondary',
									fontFamily: 'monospace'
								}
							},
							{
								id: 'welcome-text',
								type: UIComponents.Text,
								props: { text: labels.welcomeMessage },
								styles: {
									fontSize: 'base',
									textColor: 'text',
									marginTop: 2
								}
							},
							{
								id: 'subtitle-text',
								type: UIComponents.Text,
								props: { text: labels.welcomeSubtitle },
								styles: {
									fontSize: 'base',
									fontWeight: 'bold',
									textColor: 'text'
								}
							}
						]
					},
					{
						id: 'instruction-text',
						type: UIComponents.Text,
						props: { text: labels.enterAppId },
						styles: {
							textAlign: 'center',
							fontSize: 'sm',
							textColor: 'text',
							marginBottom: 3
						}
					},
					{
						id: 'input-container',
						type: UIComponents.Container,
						props: { vertical: true },
						styles: {
							marginBottom: 3,
							gap: 3
						},
						children: [
							{
								id: 'appid-input',
								type: UIComponents.Input,
								props: {
									placeholder: labels.appIdPlaceholder,
									value: appIdValue,
									type: 'text'
								},
								styles: {
									width: '100%',
									padding: 3,
									backgroundColor: '#3B3D4F',
									border: '2px solid #FBBF24',
									borderRadius: 8,
									textColor: 'text',
									fontSize: 'base',
									textAlign: 'center'
								},
								actions: {
									onChange: {
										type: 'custom',
										handler: 'handleAppIdChange'
									}
								}
							},
							{
								id: 'userid-input',
								type: UIComponents.Input,
								props: {
									placeholder: labels.userIdPlaceholder,
									value: userIdValue,
									type: 'text'
								},
								styles: {
									width: '100%',
									padding: 3,
									backgroundColor: '#3B3D4F',
									border: '2px solid #FBBF24',
									borderRadius: 8,
									textColor: 'text',
									fontSize: 'base',
									textAlign: 'center'
								},
								actions: {
									onChange: {
										type: 'custom',
										handler: 'handleUserIdChange'
									}
								}
							}
						]
					},
					{
						id: 'submit-button',
						type: UIComponents.Button,
						props: {
							text: labels.submitButton,
							fullWidth: true
						},
						styles: {
							backgroundColor: 'secondary',
							textColor: '#000000',
							padding: 3,
							borderRadius: 8,
							fontWeight: 'bold',
							fontSize: 'lg',
							height: '48px',
							marginBottom: 3
						},
						actions: {
							onClick: {
								type: 'custom',
								handler: 'handleAuthSubmit'
							}
						}
					},
					{
						id: 'help-section',
						type: UIComponents.Container,
						props: { vertical: true },
						styles: {
							backgroundColor: '#3B3D4F',
							padding: 2,
							borderRadius: 8,
							border: '1px solid #5C5E70'
						},
						children: [
							{
								id: 'help-text',
								type: UIComponents.Text,
								props: { text: labels.helpQuestion },
								styles: {
									fontSize: 'sm',
									textColor: 'text',
									fontWeight: 'semibold',
									marginBottom: 1
								}
							},
							{
								id: 'help-answer',
								type: UIComponents.Text,
								props: { text: labels.helpAnswer },
								styles: {
									fontSize: 'xs',
									textColor: 'textSecondary'
								}
							}
						]
					}
				]
			},
			theme: {
				colors: theme.colors,
				spacing: theme.spacing
			}
		};
	}

	private _createLoadingPopup(): UIDescriptor {
		const { labels } = this._config!;
		const theme = this._config!.theme;

		return {
			layout: {
				id: 'auth-popup-loading',
				type: UIComponents.Popup,
				props: {
					isOpen: true,
					showCloseButton: false
				},
				styles: {
					backgroundColor: 'surface',
					padding: 8,
					borderRadius: 12,
					width: '400px',
					textAlign: 'center'
				},
				children: [
					{
						id: 'loading-spinner',
						type: UIComponents.Container,
						props: {},
						styles: {
							marginBottom: 3
						},
						children: [
							{
								id: 'spinner-text',
								type: UIComponents.Text,
								props: { text: '⏳' },
								styles: {
									fontSize: '4xl'
								}
							}
						]
					},
					{
						id: 'loading-text',
						type: UIComponents.Text,
						props: { text: labels.loadingMessage },
						styles: {
							fontSize: 'base',
							textColor: 'text'
						}
					}
				]
			},
			theme: {
				colors: theme.colors,
				spacing: theme.spacing
			}
		};
	}

	private _createSuccessPopup(): UIDescriptor {
		const { labels } = this._config!;
		const theme = this._config!.theme;
		const username = this._currentUser?.username || 'User';

		return {
			layout: {
				id: 'auth-popup-success',
				type: UIComponents.Popup,
				props: {
					isOpen: true,
					showCloseButton: false
				},
				styles: {
					backgroundColor: 'surface',
					padding: 8,
					borderRadius: 12,
					width: '400px',
					textAlign: 'center'
				},
				children: [
					{
						id: 'success-icon',
						type: UIComponents.Text,
						props: { text: '✓' },
						styles: {
							fontSize: '4xl',
							textColor: 'success',
							marginBottom: 2
						}
					},
					{
						id: 'success-title',
						type: UIComponents.Text,
						props: { text: labels.successMessage },
						styles: {
							fontSize: 'xl',
							fontWeight: 'bold',
							textColor: 'text',
							marginBottom: 1
						}
					},
					{
						id: 'welcome-user',
						type: UIComponents.Text,
						props: { text: `Welcome, ${username}!` },
						styles: {
							fontSize: 'base',
							textColor: 'textSecondary'
						}
					}
				]
			},
			theme: {
				colors: theme.colors,
				spacing: theme.spacing
			}
		};
	}

	private _createErrorPopup(errorMessage: string | null): UIDescriptor {
		const { labels } = this._config!;
		const theme = this._config!.theme;

		return {
			layout: {
				id: 'auth-popup-error',
				type: UIComponents.Popup,
				props: {
					isOpen: true,
					showCloseButton: true
				},
				styles: {
					backgroundColor: 'surface',
					padding: 8,
					borderRadius: 12,
					width: '400px',
					textAlign: 'center'
				},
				children: [
					{
						id: 'error-icon',
						type: UIComponents.Text,
						props: { text: '✗' },
						styles: {
							fontSize: '4xl',
							textColor: 'error',
							marginBottom: 2
						}
					},
					{
						id: 'error-title',
						type: UIComponents.Text,
						props: { text: labels.errorMessage },
						styles: {
							fontSize: 'xl',
							fontWeight: 'bold',
							textColor: 'text',
							marginBottom: 1
						}
					},
					{
						id: 'error-message',
						type: UIComponents.Text,
						props: { text: errorMessage || 'Please try again' },
						styles: {
							fontSize: 'sm',
							textColor: 'textSecondary'
						}
					}
				]
			},
			theme: {
				colors: theme.colors,
				spacing: theme.spacing
			}
		};
	}
}
