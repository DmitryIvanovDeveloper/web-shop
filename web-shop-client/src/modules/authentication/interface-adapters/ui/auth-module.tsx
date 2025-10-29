'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import type { AppUser } from '../../domain/types';
import type { UIRendererPort } from '../../../../application/ports/ui-renderer.port';

interface AuthModuleProps {
	children?: React.ReactNode;
	renderSidebarButton?: boolean;
	renderPopupConfig?: boolean;
}

type PopupState = 'idle' | 'loading' | 'success' | 'error';

function AuthModuleContent({ children, renderSidebarButton = false, renderPopupConfig = false }: AuthModuleProps) {
	const searchParams = useSearchParams();
	const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
	const uiRenderer = container.get<UIRendererPort>(ROOT_TYPES.UIRenderer);
	
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
	const [showPopup, setShowPopup] = useState(false);
	const [popupState, setPopupState] = useState<PopupState>('idle');
	const [appIdValue, setAppIdValue] = useState('');
	const [userIdValue, setUserIdValue] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isConfigReady, setIsConfigReady] = useState(false);

	// Проверяем состояние авторизации
	useEffect(() => {
		const checkAuth = () => {
			const authStatus = authPresenter.isUserAuthenticated();
			const user = authPresenter.getCurrentUser();
			
			if (authStatus !== isAuthenticated) {
				console.log('[AuthModule] Auth status changed:', { from: isAuthenticated, to: authStatus });
				setIsAuthenticated(authStatus);
				setCurrentUser(user);
				
				// Если пользователь авторизовался - закрываем popup
				if (authStatus === true && showPopup) {
					console.log('[AuthModule] User authenticated, closing popup');
					setShowPopup(false);
					setPopupState('idle');
				}
			}
		};

		// Проверяем начальное состояние
		checkAuth();

		// Подписываемся на события авторизации
		const eventListener = () => {
			console.log('[AuthModule] authStateChanged event received');
			checkAuth();
		};
		
		window.addEventListener('authStateChanged', eventListener);

		return () => {
			window.removeEventListener('authStateChanged', eventListener);
		};
	}, [isAuthenticated, showPopup, authPresenter]);

	// Подписка на событие showAuthPopup (для показа popup при попытке покупки)
	useEffect(() => {
		if (!renderPopupConfig) {
			return;
		}

		const handleShowAuthPopup = () => {
			console.log('[AuthModule] showAuthPopup event received');
			setShowPopup(true);
			setPopupState('idle');
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('showAuthPopup', handleShowAuthPopup);
			return () => window.removeEventListener('showAuthPopup', handleShowAuthPopup);
		}
	}, [renderPopupConfig]);

	// Проверка готовности конфига для рендера Login button
	useEffect(() => {
		// Проверяем сразу при монтировании
		const ready = authPresenter.isConfigReady();
		if (ready !== isConfigReady) {
			console.log('[AuthModule] Config ready state changed:', ready);
			setIsConfigReady(ready);
		}

		// Подписываемся на событие загрузки конфига (если нужно)
		const handleConfigLoaded = () => {
			console.log('[AuthModule] AppConfig loaded event detected');
			setIsConfigReady(true);
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('appConfigLoaded', handleConfigLoaded);
			return () => window.removeEventListener('appConfigLoaded', handleConfigLoaded);
		}
	}, [authPresenter, isConfigReady]);

	// Инициализация авторизации из query params или localStorage
	useEffect(() => {
		if (isAuthenticated) {
			console.log('[AuthModule] Already authenticated, skipping initialization');
			return;
		}

		const appId = getAppIdFromQuery() || getAppIdFromStorage() || getAppIdFromEnv();
		const userId = getUserIdFromQuery() || getUserIdFromStorage();
		
		console.log('[AuthModule] Found appId:', appId, { userId });
		
		if (!appId) {
			console.log('[AuthModule] No appId found, skipping initialization');
			return;
		}

		console.log('[AuthModule] Auto-initializing authentication', { appId, userId });
		authPresenter.initializeAuthentication(appId, userId || undefined);

	}, [searchParams, isAuthenticated, authPresenter]);

	const getAppIdFromQuery = () => searchParams.get('appId');
	const getUserIdFromQuery = () => searchParams.get('userId');
	
	const getAppIdFromStorage = () => {
		if (typeof window === 'undefined') return null;

		try {
			const storedUser = localStorage.getItem('user');
			if (!storedUser) return null;

			const user = JSON.parse(storedUser);
			return user?.appId || null;
		} catch (error) {
			localStorage.removeItem('user');
			return null;
		}
	};

	const getUserIdFromStorage = () => {
		if (typeof window === 'undefined') return null;

		try {
			const storedUser = localStorage.getItem('user');
			if (!storedUser) return null;

			const user = JSON.parse(storedUser);
			return user?.userId || null;
		} catch (error) {
			localStorage.removeItem('user');
			return null;
		}
	};

	const getAppIdFromEnv = () => {
		return process.env.NEXT_PUBLIC_APP_ID || null;
	};

	// Handler для клика по кнопке Login
	const handleLoginClick = () => {
		console.log('[AuthModule] Login button clicked, showing popup');
		setShowPopup(true);
		setPopupState('idle');
		setAppIdValue('');
		setUserIdValue('');
		setErrorMessage(null);
	};

	// Handler для изменения App ID в input
	const handleAppIdChange = (value: string) => {
		console.log('[AuthModule] App ID changed:', value);
		setAppIdValue(value);
		// Очищаем ошибку при изменении
		if (errorMessage) {
			setErrorMessage(null);
		}
	};

	// Handler для изменения User ID в input
	const handleUserIdChange = (value: string) => {
		console.log('[AuthModule] User ID changed:', value);
		setUserIdValue(value);
		// Очищаем ошибку при изменении
		if (errorMessage) {
			setErrorMessage(null);
		}
	};

	// Handler для submit формы
	const handleAuthSubmit = async () => {
		console.log('[AuthModule] Auth submit called with appId:', appIdValue, 'userId:', userIdValue);

		if (!appIdValue?.trim()) {
			console.error('[AuthModule] No appId provided');
			setPopupState('error');
			setErrorMessage('Please enter App ID');
			return;
		}

		if (!userIdValue?.trim()) {
			console.error('[AuthModule] No userId provided');
			setPopupState('error');
			setErrorMessage('Please enter User ID');
			return;
		}

		setPopupState('loading');
		console.log('[AuthModule] Starting authentication with appId:', appIdValue, 'userId:', userIdValue);

		try {
			// Небольшая задержка для демонстрации loading
			await new Promise(resolve => setTimeout(resolve, 800));
			
			const result = await authPresenter.initializeAuthentication(appIdValue.trim(), userIdValue.trim());

			if (result.status === 'success') {
				console.log('[AuthModule] Authentication successful');
				setPopupState('success');
				
				// Через 1.5 секунды закрываем popup
				setTimeout(() => {
					setShowPopup(false);
					setPopupState('idle');
					setAppIdValue('');
					setUserIdValue('');
					setErrorMessage(null);
				}, 1500);
			} else {
				console.error('[AuthModule] Authentication failed:', result.error);
				setPopupState('error');
				setErrorMessage(result.error || 'Authentication failed. Please try again.');
			}
		} catch (error) {
			console.error('[AuthModule] Authentication error:', error);
			setPopupState('error');
			setErrorMessage('An unexpected error occurred. Please try again.');
		}
	};

	// Handler для закрытия popup
	const handlePopupClose = () => {
		console.log('[AuthModule] Popup close requested');
		setShowPopup(false);
		setPopupState('idle');
		setAppIdValue('');
		setUserIdValue('');
		setErrorMessage(null);
	};

	// Рендерим Sidebar Button через UI Renderer Service
	const renderLoginButton = () => {
		if (!renderSidebarButton || isAuthenticated) {
			return null;
		}

		// Проверяем готовность конфига перед рендером
		if (!authPresenter.isConfigReady()) {
			console.log('[AuthModule] Config not ready yet, skipping login button render');
			return null;
		}

		try {
			// Создаём UIDescriptor из Presenter
			const descriptor = authPresenter.createLoginButtonUI();

			// Добавляем реальный handler в context
			const contextWithHandlers = {
				...descriptor.context,
				handleLoginClick: () => {
					handleLoginClick();
				}
			};

			// Рендерим через UI Renderer Service
			return uiRenderer.renderUI({
				...descriptor,
				context: contextWithHandlers
			});
		} catch (error) {
			console.error('[AuthModule] Error rendering login button:', error);
			// Не рендерим кнопку при ошибке
			return null;
		}
	};

	// Рендерим User Info
	const renderUserInfo = () => {
		if (!renderSidebarButton || !isAuthenticated || !currentUser) {
			return null;
		}

		return (
			<div className="p-4">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
						<span className="text-white font-bold text-lg">
							{currentUser.username.charAt(0).toUpperCase()}
						</span>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white">
							{currentUser.username}
						</h3>
						<p className="text-sm text-gray-300">
							App ID: {currentUser.appId}
						</p>
						<p className="text-xs text-green-400 font-medium">
							✓ Авторизован
						</p>
					</div>
				</div>
			</div>
		);
	};

	// Рендерим Auth Popup через UI Renderer Service
	const renderAuthPopup = () => {
		if (!showPopup || !renderPopupConfig) {
			return null;
		}

		try {
			// Создаём UIDescriptor из Presenter
			const descriptor = authPresenter.createAuthPopupUI(
				popupState,
				appIdValue,
				userIdValue,
				errorMessage
			);

			// Добавляем реальные handlers в context
			const contextWithHandlers = {
				...descriptor.context,
				handleAppIdChange: (value: string) => {
					handleAppIdChange(value);
				},
				handleUserIdChange: (value: string) => {
					handleUserIdChange(value);
				},
				handleAuthSubmit: () => {
					handleAuthSubmit();
				},
				onPopupClose: () => {
					handlePopupClose();
				}
			};

			// Рендерим через UI Renderer Service
			return uiRenderer.renderUI({
				...descriptor,
				context: contextWithHandlers
			});
		} catch (error) {
			console.error('[AuthModule] Error rendering popup:', error);
			return (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 p-6 rounded-lg">
						<p className="text-red-500">Failed to render authentication popup</p>
						<button 
							onClick={handlePopupClose}
							className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
						>
							Close
						</button>
					</div>
				</div>
			);
		}
	};

	return (
		<>
			{children}

			{/* Sidebar Login Button или User Info */}
			{renderLoginButton()}
			{renderUserInfo()}

			{/* Auth Popup через UI Renderer Service */}
			{renderAuthPopup()}
		</>
	);
}

export function AuthModule(props: AuthModuleProps) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AuthModuleContent {...props} />
		</Suspense>
	);
}
