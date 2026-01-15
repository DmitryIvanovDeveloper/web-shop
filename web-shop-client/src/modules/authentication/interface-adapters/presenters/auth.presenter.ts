
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
import { TryAuthenticateUseCase } from '../../application/use-cases/try-authenticate.use-case';
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
	private _viewModel: AuthViewModel = {
		status: 'idle',
		user: undefined,
		error: undefined,
		labels: {
			loginButton: 'Login',
			logoutButton: 'Logout',
			appIdPlaceholder: 'Enter App ID',
			userIdPlaceholder: 'Enter User ID',
			submitButton: 'Submit',
			welcomeTitle: 'WebShop HUB',
			welcomeMessage: 'Welcome to',
			welcomeSubtitle: 'WebShop 3D Hub',
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
		}
	};
	private _subscribers: Array<(vm: AuthViewModel) => void> = [];

	private _labels: AuthLabels = {
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

	public get labels(): AuthLabels {
		return { ...this._labels };
	}

	/**
	 * Получение текущего ViewModel (копия для иммутабельности)
	 */
	public get viewModel(): AuthViewModel {
		return { ...this._viewModel };
	}

	/**
	 * Подписка на изменения ViewModel (паттерн как в других модулях)
	 */
	public subscribe(callback: (vm: AuthViewModel) => void): () => void {
		this._subscribers.push(callback);
		// Вызываем callback сразу с текущим состоянием
		callback(this.viewModel);
		return () => {
			const index = this._subscribers.indexOf(callback);
			if (index > -1) {
				this._subscribers.splice(index, 1);
			}
		};
	}

	/**
	 * Уведомление подписчиков об изменении ViewModel
	 */
	private _notifySubscribers(): void {
		const currentViewModel = this.viewModel;
		this._subscribers.forEach(callback => callback(currentViewModel));
	}

	/**
	 * Обновление ViewModel и уведомление подписчиков
	 */
	private _updateViewModel(updates: Partial<AuthViewModel>): void {
		this._viewModel = { ...this._viewModel, ...updates };
		this._notifySubscribers();
	}

	/**
	 * Обновляет labels на основе полученных переводов
	 */
	public updateLabelsFromTranslations(translations: Record<string, string>): void {
		this._labels = {
			loginButton: translations['auth.loginButton'] || 'Login',
			logoutButton: translations['auth.logoutButton'] || 'Logout',
			appIdPlaceholder: translations['auth.appIdPlaceholder'] || 'Enter App ID',
			userIdPlaceholder: translations['auth.userIdPlaceholder'] || 'Enter User ID',
			submitButton: translations['auth.submitButton'] || 'Submit',
			welcomeTitle: translations['auth.welcomeTitle'] || 'PG3D HUB',
			welcomeMessage: translations['auth.welcomeMessage'] || 'Welcome to',
			welcomeSubtitle: translations['auth.welcomeSubtitle'] || 'Pixel Gun 3D Hub',
			enterAppId: translations['auth.enterAppId'] || 'Enter your App ID',
			enterUserId: translations['auth.enterUserId'] || 'Enter your User ID',
			successMessage: translations['auth.successMessage'] || 'Success!',
			loadingMessage: translations['auth.loadingMessage'] || 'Loading...',
			errorMessage: translations['auth.errorMessage'] || 'Error',
			helpQuestion: translations['auth.helpQuestion'] || 'Need help?',
			helpAnswer: translations['auth.helpAnswer'] || 'Contact support',
			agreementText: translations['auth.agreementText'] || 'I agree',
			privacyPolicy: translations['auth.privacyPolicy'] || 'Privacy Policy',
			termsOfService: translations['auth.termsOfService'] || 'Terms of Service',
			refundPolicy: translations['auth.refundPolicy'] || 'Refund Policy'
		};

		console.log('[AuthPresenter] Labels updated from translations');
	}

	constructor(
		@inject(AUTH_TYPES.TryAuthenticateUseCase)
		private readonly _tryAuthenticateUseCase: TryAuthenticateUseCase,
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
		
		// Обновляем ViewModel и уведомляем подписчиков
		this._updateViewModel({
			status: 'success',
			user: user,
			error: undefined,
			labels: this.labels
		});
		
		// Генерируем событие для обратной совместимости (если нужно)
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

		return this.viewModel;
	}

	/**
	 * Состояние загрузки
	 */
	public presentLoading(): AuthViewModel {
		this._updateViewModel({
			status: 'loading',
			user: undefined,
			error: undefined,
			labels: this.labels
		});
		return this.viewModel;
	}

	/**
	 * Начальное состояние
	 */
	public presentIdle(): AuthViewModel {
		this._updateViewModel({
			status: 'idle',
			user: undefined,
			error: undefined,
			labels: this.labels
		});
		return this.viewModel;
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
		
		// Создаем ViewModel с информацией о пользователе
		const viewModel: AuthViewModel = {
			status: 'success',
			user: user,
			error: undefined,
			labels: this.labels
		};
		
		console.log('[AuthPresenter] ViewModel created:', viewModel);
		
		// Генерируем событие для уведомления UI компонентов с ViewModel
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('authStateChanged', { 
				detail: { 
					isAuthenticated: true, 
					user,
					viewModel 
				} 
			}));
			console.log('[AuthPresenter] authStateChanged event dispatched with ViewModel');
		}
	}

	/**
	 * Сброс состояния авторизации
	 */
	public setUnauthenticated(): void {
		this._isAuthenticated = false;
		this._currentUser = null;
		
		// Обновляем ViewModel и уведомляем подписчиков
		this._updateViewModel({
			status: 'idle',
			user: undefined,
			error: undefined,
			labels: this.labels
		});
		
		// Генерируем событие для обратной совместимости
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
				error: undefined,
				labels: this.labels
			};
		}
		return this.presentIdle();
	}

	/**
	 * Упрощенная авторизация: требует appId и userId, обращается напрямую к Supabase flow
	 */
	public async tryAuthenticate(appId: string, userId: string): Promise<AuthViewModel> {
		console.log('[AuthPresenter] tryAuthenticate called', { appId, userId });
		
		// Устанавливаем состояние загрузки
		this.presentLoading();
		
		const result = await this._tryAuthenticateUseCase.execute(appId, userId);
		
		console.log('[AuthPresenter] tryAuthenticate UseCase result:', {
			isSuccess: result.isSuccess(),
			hasData: !!result.data,
			userId: result.data?.userId,
			error: result.error?.message
		});

		if (result.isSuccess()) {
			console.log('[AuthPresenter] tryAuthenticate success, calling present');
			const viewModel = this.present(result.data);
			console.log('[AuthPresenter] tryAuthenticate present completed, ViewModel:', {
				status: viewModel.status,
				hasUser: !!viewModel.user,
				userId: viewModel.user?.userId
			});
			return viewModel;
		}

		console.log('[AuthPresenter] tryAuthenticate failed, updating ViewModel with error');
		// Обновляем ViewModel с ошибкой
		this._updateViewModel({
			status: 'error',
			user: undefined,
			error: result.error?.message || 'Authentication failed',
			labels: this.labels
		});
		
		this.setUnauthenticated();
		return this.viewModel;
	}

	/**
	 * Инициализация авторизации через UseCase (оставляем для обратной совместимости)
	 */
	public async initializeAuthentication(appId: string, userId?: string): Promise<AuthViewModel> {
		if (!userId) {
			return {
				status: 'error',
				user: undefined,
				error: 'userId is required for authentication',
				labels: this.labels
			};
		}
		return this.tryAuthenticate(appId, userId);
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
		// Если конфиг не готов, используем дефолтные значения
		if (!this._config) {
			return {
				theme: {
					colors: {
						primary: '#3b82f6',
						background: '#1f2937',
						surface: '#374151',
						text: '#ffffff',
						textSecondary: '#9ca3af',
						accent: '#f59e0b',
						border: '#4b5563',
						success: '#10b981',
						error: '#ef4444',
						warning: '#f59e0b',
					},
					spacing: [4, 8, 12, 16, 24, 32],
				},
				layout: {
					id: 'login-button',
					type: UIComponents.Button,
					props: {
						text: '🔐 Login',
					},
					styles: {
						backgroundColor: '#3b82f6',
						color: '#ffffff',
						padding: '12px 24px',
						borderRadius: '8px',
						cursor: 'pointer',
						border: 'none',
					} as Record<string, any>,
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
