/**
 * Load App Config Use Case Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoadAppConfigUseCase } from '../load-app-config.use-case';
import type { HttpClient } from '../../ports/http-client.port';
import type { EventBus } from '../../ports/event-bus.port';
import type { Logger } from '../../ports/logger.port';
import type { AppConfig } from '../../../shared/config/app-config.types';
import { AppConfigLoadedEvent } from '../../../shared/events/app-config-events';

describe('LoadAppConfigUseCase', () => {
	let useCase: LoadAppConfigUseCase;
	let mockHttpClient: HttpClient;
	let mockEventBus: EventBus;
	let mockLogger: Logger;

	const mockAppConfig: AppConfig = {
		version: '1.0',
		environment: 'test',
		theme: {
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
			borderRadius: { small: 4, medium: 8, large: 12, full: 9999 },
			typography: {
				fontFamily: 'system-ui',
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
		},
		modules: {
			authentication: {
				labels: {
					loginButton: 'Login',
					logoutButton: 'Logout',
					appIdPlaceholder: 'Enter App ID',
					submitButton: 'Submit',
					welcomeTitle: 'PG3D HUB',
					welcomeMessage: 'Welcome',
					welcomeSubtitle: 'Pixel Gun 3D Hub',
					enterAppId: 'Enter your App ID',
					successMessage: 'Success!',
					loadingMessage: 'Loading...',
					errorMessage: 'Error',
					helpQuestion: 'Need help?',
					helpAnswer: 'Contact support',
					agreementText: 'I agree',
					privacyPolicy: 'Privacy Policy',
					termsOfService: 'Terms of Service',
					refundPolicy: 'Refund Policy'
				},
				settings: {
					closeDelay: 1500,
					showHelpSection: true,
					showAgreement: true,
					rememberUser: true
				}
			},
			products: {
				labels: {
					title: 'Products',
					buyButton: 'Buy',
					purchasedBadge: 'PURCHASED',
					emptyState: 'No products',
					loadingState: 'Loading...'
				},
				settings: {
					gridColumns: 4,
					gridGap: 16,
					enableFilters: false
				}
			},
			offers: {
				labels: {
					title: 'Offers',
					featuredTitle: 'Featured',
					emptyState: 'No offers',
					expiredBadge: 'EXPIRED'
				},
				settings: {
					featuredThreshold: 2,
					gridColumns: 3,
					gridGap: 16
				}
			},
			uiRenderer: {
				sidebar: { version: '1.0', theme: { colors: {}, spacing: [] }, layout: { id: 'test', type: 'Container', props: {} } },
				rightSidebar: { version: '1.0', theme: { colors: {}, spacing: [] }, layout: { id: 'test', type: 'Container', props: {} } },
				store: { version: '1.0', theme: { colors: {}, spacing: [] }, layout: { id: 'test', type: 'Container', props: {} } }
			}
		},
		constants: {
			api: {
				timeout: 10000,
				retryAttempts: 3
			},
			ui: {
				animationDuration: 300,
				toastDuration: 3000,
				mobileBreakpoint: 1024
			}
		}
	};

	beforeEach(() => {
		mockHttpClient = {
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
			patch: vi.fn()
		} as unknown as HttpClient;

		mockEventBus = {
			publishAsync: vi.fn(),
			subscribe: vi.fn(),
			subscribeAsync: vi.fn(),
			unsubscribe: vi.fn()
		} as unknown as EventBus;

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn()
		} as unknown as Logger;

		useCase = new LoadAppConfigUseCase(
			mockHttpClient,
			mockEventBus,
			mockLogger
		);
	});

	describe('execute', () => {
		it('should load app config successfully', async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValueOnce({
				status: 200,
				statusText: 'OK',
				data: mockAppConfig,
				headers: {}
			});

			const result = await useCase.execute();

			expect(result).toEqual(mockAppConfig);
			expect(mockHttpClient.get).toHaveBeenCalledWith('/api/app-config');
		});

		it('should publish AppConfigLoadedEvent after loading', async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValueOnce({
				status: 200,
				statusText: 'OK',
				data: mockAppConfig,
				headers: {}
			});

			await useCase.execute();

			expect(mockEventBus.publishAsync).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'AppConfigLoadedEvent',
					payload: { config: mockAppConfig }
				})
			);
		});

		it('should log info messages during execution', async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValueOnce({
				status: 200,
				statusText: 'OK',
				data: mockAppConfig,
				headers: {}
			});

			await useCase.execute();

			expect(mockLogger.info).toHaveBeenCalledWith(
				'[LoadAppConfigUseCase] Loading app configuration'
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				'[LoadAppConfigUseCase] App config loaded successfully',
				expect.objectContaining({
					version: '1.0',
					environment: 'test'
				})
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				'[LoadAppConfigUseCase] AppConfigLoadedEvent published'
			);
		});

		it('should throw error if HTTP response status is not 200', async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValueOnce({
				status: 404,
				statusText: 'Not Found',
				data: null,
				headers: {}
			});

			await expect(useCase.execute()).rejects.toThrow(
				'Failed to load app config'
			);

			expect(mockLogger.error).toHaveBeenCalledWith(
				'[LoadAppConfigUseCase] Failed to load app config',
				expect.objectContaining({ status: 404 })
			);
		});

		it('should throw error if HTTP response data is null', async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValueOnce({
				status: 200,
				statusText: 'OK',
				data: null,
				headers: {}
			});

			await expect(useCase.execute()).rejects.toThrow(
				'Failed to load app config'
			);
		});

		it('should not publish event if loading fails', async () => {
			vi.mocked(mockHttpClient.get).mockResolvedValueOnce({
				status: 500,
				statusText: 'Internal Server Error',
				data: null,
				headers: {}
			});

			await expect(useCase.execute()).rejects.toThrow();

			expect(mockEventBus.publishAsync).not.toHaveBeenCalled();
		});
	});
});




