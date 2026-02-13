


import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result/result';
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

	
	public get viewModel(): AuthViewModel {
		return { ...this._viewModel };
	}

	
	public subscribe(callback: (vm: AuthViewModel) => void): () => void {
		this._subscribers.push(callback);
				callback(this.viewModel);
		return () => {
			const index = this._subscribers.indexOf(callback);
			if (index > -1) {
				this._subscribers.splice(index, 1);
			}
		};
	}

	
	private _notifySubscribers(): void {
		const currentViewModel = this.viewModel;
		this._subscribers.forEach(callback => callback(currentViewModel));
	}

	
	private _updateViewModel(updates: Partial<AuthViewModel>): void {
		this._viewModel = { ...this._viewModel, ...updates };
		this._notifySubscribers();
	}

	
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

			}

	constructor(
		@inject(AUTH_TYPES.TryAuthenticateUseCase)
		private readonly _tryAuthenticateUseCase: TryAuthenticateUseCase,
	) { }
	
	public present(user: AppUser): AuthViewModel {
				this._isAuthenticated = true;
		this._currentUser = user;
		
						this._updateViewModel({
			status: 'success',
			user: user,
			error: undefined,
			labels: this.labels
		});
		
				if (typeof window !== 'undefined') {
			const event = new CustomEvent('authStateChanged', { 
				detail: { isAuthenticated: true, user } 
			});
						window.dispatchEvent(event);
					} else {
					}

		return this.viewModel;
	}

	
	public presentLoading(): AuthViewModel {
		this._updateViewModel({
			status: 'loading',
			user: undefined,
			error: undefined,
			labels: this.labels
		});
		return this.viewModel;
	}

	
	public presentIdle(): AuthViewModel {
		this._updateViewModel({
			status: 'idle',
			user: undefined,
			error: undefined,
			labels: this.labels
		});
		return this.viewModel;
	}

	

	
	public isUserAuthenticated(): boolean {
		console.log('[AuthPresenter] isUserAuthenticated called:', { 
			isAuthenticated: this._isAuthenticated,
			currentUser: this._currentUser,
			timestamp: new Date().toISOString()
		});
		return this._isAuthenticated;
	}

	
	public getCurrentUser(): AppUser | null {
		return this._currentUser;
	}

	
	public setAuthenticated(user: AppUser): void {
				this._isAuthenticated = true;
		this._currentUser = user;
						const viewModel: AuthViewModel = {
			status: 'success',
			user: user,
			error: undefined,
			labels: this.labels
		};
		
						if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('authStateChanged', { 
				detail: { 
					isAuthenticated: true, 
					user,
					viewModel 
				} 
			}));
					}
	}

	
	public setUnauthenticated(): void {
		this._isAuthenticated = false;
		this._currentUser = null;
		
				this._updateViewModel({
			status: 'idle',
			user: undefined,
			error: undefined,
			labels: this.labels
		});
		
				if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('authStateChanged', { 
				detail: { isAuthenticated: false, user: null } 
			}));
		}
	}

	
	public showAuthPopup(): void {
						if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('showAuthPopup', { 
				detail: { reason: 'authentication_required' } 
			}));
		}
	}

	
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

	
	public async tryAuthenticate(appId: string, userId: string): Promise<AuthViewModel> {
						this.presentLoading();
		
		const result = await this._tryAuthenticateUseCase.execute(appId, userId);
		
		console.log('[AuthPresenter] tryAuthenticate UseCase result:', {
			isSuccess: result.isSuccess,
			hasData: !!result.value,
			userId: result.value?.userId,
			error: result.error?.message
		});

		if (result.isSuccess) {
						const viewModel = this.present(result.value);
						return viewModel;
		}

						this._updateViewModel({
			status: 'error',
			user: undefined,
			error: result.error?.message || 'Authentication failed',
			labels: this.labels
		});
		
		this.setUnauthenticated();
		return this.viewModel;
	}

	
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

	

	
	public setConfig(config: AuthModuleConfig): void {
		this._config = config;
		Object.assign(this.labels, config.labels);
	}

	
	public isConfigReady(): boolean {
		return this._config !== null;
	}

	
	private async _loadPopupLayoutFromUIConfig(): Promise<any | null> {
		try {
			if (typeof window === 'undefined') {
				return null;
			}

			const response = await fetch('/mocks/api/authentication/ui-config.json');
			if (!response.ok) {
								return null;
			}

			const uiConfig = await response.json();
			const popupLayout = uiConfig.loginPopup?.layout;

			if (!popupLayout) {
								return null;
			}

						return popupLayout;
		} catch (error) {
						return null;
		}
	}

	
	private async _loadFallbackConfig(): Promise<AuthModuleConfig | null> {
		try {
			if (typeof window === 'undefined') {
				return null;
			}

			const response = await fetch('/mocks/api/app-config.json');
			if (!response.ok) {
								return null;
			}

			const appConfig = await response.json();
			const authConfig = appConfig.modules?.authentication;

			if (!authConfig) {
								return null;
			}

						const fallbackConfig: AuthModuleConfig = {
				labels: authConfig.labels || this._labels,
				settings: authConfig.settings || {
					closeDelay: 1500,
					showHelpSection: true,
					showAgreement: true,
					rememberUser: true
				},
				loginButtonUI: authConfig.loginButtonUI || {
					type: 'Button',
					id: 'login-button',
					props: {
						text: 'Login',
						icon: '',
						fullWidth: true
					},
					styles: {
						backgroundColor: '#FBBF24',
						color: '#000000',
						fontWeight: 'bold',
						fontSize: '16px',
						height: '48px',
						borderRadius: '8px',
						padding: '12px 16px',
						width: '100%',
						border: 'none',
						cursor: 'pointer',
						transition: 'all 0.2s ease'
					},
					actions: {
						onClick: {
							type: 'custom',
							handler: 'handleLoginClick'
						}
					},
					children: []
				},
				theme: appConfig.theme || {
					colors: {
						primary: '#3B5AFE',
						secondary: '#FBBF24',
						accent: '#FF6B35',
						background: '#0D1117',
						surface: '#161B22',
						text: '#FFFFFF',
						textSecondary: '#A0A0A0',
						success: '#10B981',
						error: '#EF4444',
						warning: '#FFA500',
						border: '#374151'
					},
					spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
					borderRadius: {
						small: 4,
						medium: 8,
						large: 12,
						full: 9999
					},
					typography: {
						fontFamily: 'system-ui, -apple-system, sans-serif',
						fontSize: {
							xs: '12px',
							sm: '14px',
							base: '16px',
							lg: '18px',
							xl: '20px',
							'2xl': '24px',
							'3xl': '30px',
							'4xl': '36px'
						},
						fontWeight: {
							normal: 400,
							medium: 500,
							semibold: 600,
							bold: 700,
							extrabold: 800
						}
					}
				}
			};

						return fallbackConfig;
		} catch (error) {
						return null;
		}
	}

	
	private async _getConfig(): Promise<AuthModuleConfig | null> {
		if (this._config) {
			return this._config;
		}

				const fallbackConfig = await this._loadFallbackConfig();
		if (fallbackConfig) {
						this._config = fallbackConfig;
			Object.assign(this._labels, fallbackConfig.labels);
			return fallbackConfig;
		}

		return null;
	}

	
	public createLoginButtonUI(): UIDescriptor {
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
						width: '100%',
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
				styles: {
					...buttonConfig.styles,
					width: '100%',
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

	
	public async createAuthPopupUI(
		state: 'idle' | 'loading' | 'success' | 'error',
		appIdValue: string,
		userIdValue: string,
		errorMessage: string | null
	): Promise<UIDescriptor> {
				const config = await this._getConfig();
		if (!config) {
						return this._createMinimalFallbackPopup(state, appIdValue, userIdValue, errorMessage);
		}

				const originalConfig = this._config;
		this._config = config;

		try {
			if (state === 'loading') {
				return this._createLoadingPopup();
			}

			if (state === 'success') {
				return this._createSuccessPopup();
			}

			if (state === 'error') {
				return this._createErrorPopup(errorMessage);
			}

			return await this._createIdlePopup(appIdValue, userIdValue);
		} finally {
						this._config = originalConfig;
		}
	}

	
	private _transformPopupLayoutToUIDescriptor(
		popupLayout: any,
		labels: AuthLabels,
		theme: GlobalTheme,
		appIdValue: string,
		userIdValue: string
	): UIDescriptor {
				const mapComponentType = (type: string): string => {
			const typeMap: Record<string, string> = {
				'Popup': UIComponents.Popup,
				'Container': UIComponents.Container,
				'Text': UIComponents.Text,
				'Input': UIComponents.Input,
				'Button': UIComponents.Button
			};
			return typeMap[type] || UIComponents.Container;
		};

				const transformChildren = (children: any[]): any[] => {
			return children.map((child: any) => {
				const transformed: any = {
					id: child.id,
					type: mapComponentType(child.type),
					props: { ...child.props },
					styles: { ...child.styles },
					actions: child.actions || {}
				};

								if (transformed.id === 'input-text' && child.props?.placeholder === 'App ID') {
					transformed.props.value = appIdValue;
					transformed.props.placeholder = labels.appIdPlaceholder;
					if (transformed.actions.onChange) {
						transformed.actions.onChange.handler = 'handleAppIdChange';
					}
				} else if (transformed.id === 'input-text' && child.props?.placeholder === 'User ID') {
					transformed.props.value = userIdValue;
					transformed.props.placeholder = labels.userIdPlaceholder;
					if (transformed.actions.onChange) {
						transformed.actions.onChange.handler = 'handleUserIdChange';
					}
				} else if (transformed.id === 'login-button' || transformed.id === 'submit-button') {
					transformed.props.text = labels.submitButton;
					if (transformed.actions.onClick) {
						transformed.actions.onClick.handler = 'handleAuthSubmit';
					}
				}

								if (transformed.props.text) {
					if (transformed.props.text === 'Welcome to ') {
						transformed.props.text = labels.welcomeMessage;
					} else if (transformed.props.text === 'Game: Online Shooter Hub') {
						transformed.props.text = labels.welcomeSubtitle;
					} else if (transformed.props.text === 'Enter your App ID to continue') {
						transformed.props.text = labels.enterAppId;
					} else if (transformed.props.text === 'Where do I find my App ID?') {
						transformed.props.text = labels.helpQuestion;
					} else if (transformed.props.text === 'App ID is provided by WebShop Game app. Try: game-123 or app-456') {
						transformed.props.text = labels.helpAnswer;
					}
				}

								if (child.children && Array.isArray(child.children)) {
					transformed.children = transformChildren(child.children);
				} else {
					transformed.children = [];
				}

				return transformed;
			});
		};

		return {
			theme: {
				colors: theme.colors,
				spacing: theme.spacing
			},
			layout: {
				id: popupLayout.id || 'auth-popup-root',
				type: mapComponentType(popupLayout.type),
				props: {
					...popupLayout.props,
					isOpen: true
				},
				styles: popupLayout.styles || {},
				actions: popupLayout.actions || {},
				children: popupLayout.children ? transformChildren(popupLayout.children) : []
			},
			context: {}
		};
	}

	
	private _createMinimalFallbackPopup(
		state: 'idle' | 'loading' | 'success' | 'error',
		appIdValue: string,
		userIdValue: string,
		errorMessage: string | null
	): UIDescriptor {
		const defaultTheme = {
			colors: {
				primary: '#3B5AFE',
				secondary: '#FBBF24',
				accent: '#FF6B35',
				background: '#0D1117',
				surface: '#161B22',
				text: '#FFFFFF',
				textSecondary: '#A0A0A0',
				success: '#10B981',
				error: '#EF4444',
				warning: '#FFA500',
				border: '#374151'
			},
			spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80]
		};

		if (state === 'loading') {
			return {
				layout: {
					id: 'auth-popup-loading',
					type: UIComponents.Popup,
					props: { isOpen: true, showCloseButton: false },
					styles: {
						backgroundColor: '#161B22',
						padding: '32px',
						borderRadius: '12px',
						width: '400px',
						textAlign: 'center'
					},
					children: [
						{
							id: 'loading-text',
							type: UIComponents.Text,
							props: { text: 'Loading...' },
							styles: { fontSize: '16px', color: '#FFFFFF' }
						}
					]
				},
				theme: defaultTheme,
				context: {}
			};
		}

				return {
			layout: {
				id: 'auth-popup-root',
				type: UIComponents.Popup,
				props: { isOpen: true, showCloseButton: true },
				styles: {
					backgroundColor: '#161B22',
					padding: '32px',
					borderRadius: '12px',
					width: '480px',
					maxWidth: '90vw'
				},
				children: [
					{
						id: 'title',
						type: UIComponents.Text,
						props: { text: 'Authentication Required' },
						styles: { fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 }
					},
					{
						id: 'appid-input',
						type: UIComponents.Input,
						props: { placeholder: 'Enter App ID', value: appIdValue, type: 'text' },
						styles: {
							width: '100%',
							padding: 12,
							backgroundColor: '#3B3D4F',
							border: '2px solid #FBBF24',
							borderRadius: 8,
							color: '#FFFFFF',
							marginBottom: 12
						},
						actions: {
							onChange: { type: 'custom', handler: 'handleAppIdChange' }
						}
					},
					{
						id: 'userid-input',
						type: UIComponents.Input,
						props: { placeholder: 'Enter User ID', value: userIdValue, type: 'text' },
					styles: {
						width: '100%',
						padding: 12,
						backgroundColor: '#3B3D4F',
						border: '2px solid #FBBF24',
						borderRadius: 8,
						color: '#FFFFFF',
						marginBottom: 12
					},
					actions: {
						onChange: { type: 'custom', handler: 'handleUserIdChange' }
					}
				},
				{
					id: 'submit-button',
					type: UIComponents.Button,
					props: { text: 'Submit', fullWidth: true },
					styles: {
						backgroundColor: '#FBBF24',
						color: '#000000',
						padding: 12,
						borderRadius: 8,
						fontWeight: 'bold',
						fontSize: '16px',
						height: 48
					},
						actions: {
							onClick: { type: 'custom', handler: 'handleAuthSubmit' }
						}
					}
				]
			},
			theme: defaultTheme,
			context: {}
		};
	}

	private async _createIdlePopup(appIdValue: string, userIdValue: string): Promise<UIDescriptor> {
		const { labels } = this._config!;
		const theme = this._config!.theme;

				const popupLayout = await this._loadPopupLayoutFromUIConfig();
		if (popupLayout) {
						return this._transformPopupLayoutToUIDescriptor(popupLayout, labels, theme, appIdValue, userIdValue);
		}

		
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
