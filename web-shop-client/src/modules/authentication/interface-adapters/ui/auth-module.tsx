'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import type { AppUser } from '../../domain/types';
import type { AuthPresenter } from '../presenters/auth.presenter';
import type { SessionStoragePort } from '../../application/ports/session-storage.port';
import type { AuthViewModel } from '../view-models/auth.view-model';
import { AuthSkeleton } from './components/auth-skeleton';
import { UserInfo } from './components/user-info';
import { LoginButton } from './components/login-button';
import { AuthPopup } from './components/auth-popup';

interface AuthModuleProps {
	children?: React.ReactNode;
	renderSidebarButton?: boolean;
	renderPopupConfig?: boolean;
}

type PopupState = 'idle' | 'loading' | 'success' | 'error';

function AuthModuleContent({ children, renderSidebarButton = false, renderPopupConfig = false }: AuthModuleProps) {
	const searchParams = useSearchParams();
	const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
	const sessionStorage = container.get<SessionStoragePort>(AUTH_TYPES.SessionStoragePort);
	
	// Используем ViewModel из presenter (паттерн как в других модулях)
	const [viewModel, setViewModel] = useState<AuthViewModel>(() => authPresenter.viewModel);
	const [showPopup, setShowPopup] = useState(false);
	const [popupState, setPopupState] = useState<PopupState>('idle');
	const [appIdValue, setAppIdValue] = useState('');
	const [userIdValue, setUserIdValue] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isConfigReady, setIsConfigReady] = useState(false);
	
	// Вычисляемые значения из ViewModel
	const isAuthenticated = viewModel.status === 'success' && !!viewModel.user;
	const currentUser = viewModel.user || null;
	const isAuthenticating = viewModel.status === 'loading';

	const handleShowAuthPopup = useCallback(() => {
		console.log('[AuthModule] showAuthPopup event received');
		
		// Получаем userId и appId из query для предзаполнения полей (если есть)
		const userIdFromQuery = searchParams.get('userId');
		const appIdFromQuery = searchParams.get('appId');
		
		// Показываем popup и сбрасываем состояние
		setShowPopup(true);
		setPopupState('idle');
		setErrorMessage(null);
		
		// Предзаполняем поля если есть данные в query
		if (userIdFromQuery) {
			setUserIdValue(userIdFromQuery);
		} else {
			setUserIdValue('');
		}
		if (appIdFromQuery) {
			setAppIdValue(appIdFromQuery);
		} else {
			setAppIdValue('');
		}
	}, [searchParams]);

	const handleCloseAuthPopup = useCallback(() => {
		console.log('[AuthModule] closeAuthPopup event received');
		setShowPopup(false);
		setPopupState('idle');
		setErrorMessage(null);
	}, []);
		
	useEffect(() => {
		if (!renderPopupConfig) {
			return;
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('showAuthPopup', handleShowAuthPopup);
			window.addEventListener('closeAuthPopup', handleCloseAuthPopup);
			return () => {
				window.removeEventListener('showAuthPopup', handleShowAuthPopup);
				window.removeEventListener('closeAuthPopup', handleCloseAuthPopup);
			};
		}
	}, [renderPopupConfig, searchParams, authPresenter, handleShowAuthPopup, handleCloseAuthPopup]);
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

	// Подписка на изменения ViewModel из presenter (паттерн как в других модулях)
	useEffect(() => {
		console.log('[AuthModule] Subscribing to presenter ViewModel changes');
		
		// Подписываемся на изменения ViewModel
		const unsubscribe = authPresenter.subscribe((newViewModel) => {
			console.log('[AuthModule] ViewModel updated from presenter:', {
				status: newViewModel.status,
				hasUser: !!newViewModel.user,
				userId: newViewModel.user?.userId,
				error: newViewModel.error
			});
			setViewModel(newViewModel);
		});

		return unsubscribe;
	}, [authPresenter]);

	// Инициализация авторизации из query params или localStorage
	useEffect(() => {
		// Всегда авторизируем при первом useEffect для синхронизации состояния
		// и обновления last_active_at на сервере
		(async () => {
			console.log('[AuthModule] Starting authentication initialization');
			
			const appId = getAppIdFromQuery();
			const userId = getUserIdFromQuery();
			console.log('[AuthModule] Query params:', { appId, userId });
			
			// Если нет в query, загружаем из localStorage через порт
			const appIdFromStorage = appId || (await getAppIdFromStorage());
			const userIdFromStorage = userId || (await getUserIdFromStorage());
			console.log('[AuthModule] After storage load:', { appIdFromStorage, userIdFromStorage });

			if (!appIdFromStorage || !userIdFromStorage) {
				console.log('[AuthModule] No appId/userId found, marking unauthenticated');
				// ViewModel обновится через subscribe при вызове setUnauthenticated
				return;
			}

			try {
				console.log('[AuthModule] Calling tryAuthenticate with:', { appIdFromStorage, userIdFromStorage });
				// tryAuthenticate обновит ViewModel и уведомит подписчиков через subscribe
				const result = await authPresenter.tryAuthenticate(appIdFromStorage, userIdFromStorage);
				console.log('[AuthModule] tryAuthenticate completed, ViewModel will be updated via subscribe:', {
					status: result.status,
					hasUser: !!result.user,
					userId: result.user?.userId,
					username: result.user?.username,
					appId: result.user?.appId,
					error: result.error
				});
			} catch (error) {
				console.error('[AuthModule] Authentication error:', error);
				// ViewModel обновится через subscribe при ошибке
			}
		})();

	}, [searchParams, authPresenter, sessionStorage]);

	const getAppIdFromQuery = () => searchParams.get('appId') || searchParams.get('app');
	const getUserIdFromQuery = () => searchParams.get('userId');
	
	// Обновить функции для использования SessionStoragePort
	const getAppIdFromStorage = async () => {
		const result = await sessionStorage.load();
		if (result.isSuccess() && result.data) {
			return result.data.appId;
		}
		return null;
	};

	const getUserIdFromStorage = async () => {
		const result = await sessionStorage.load();
		if (result.isSuccess() && result.data) {
			return result.data.userId;
		}
		return null;
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
			
			const result = await authPresenter.tryAuthenticate(appIdValue.trim(), userIdValue.trim());

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





	// Логирование состояния для отладки
	console.log('[AuthModule] Render state:', {
		viewModelStatus: viewModel.status,
		isAuthenticating,
		isAuthenticated,
		hasCurrentUser: !!currentUser,
		currentUserId: currentUser?.userId,
		renderSidebarButton,
		willShowSkeleton: isAuthenticating && renderSidebarButton,
		willShowLoginButton: !isAuthenticating && renderSidebarButton && !isAuthenticated,
		willShowUserInfo: !isAuthenticating && renderSidebarButton && isAuthenticated
	});

	return (
		<>
	
			{children}

			{/* Skeleton во время авторизации */}
			{isAuthenticating && renderSidebarButton && (
				<AuthSkeleton />
			)}

			{/* Sidebar Login Button или User Info */}
			{!isAuthenticating && (
				<>
					{!isAuthenticated && (
						<LoginButton 
							renderSidebarButton={renderSidebarButton}
							onLoginClick={handleLoginClick}
						/>
					)}
					{isAuthenticated && (
						<UserInfo 
							renderSidebarButton={renderSidebarButton}
							currentUser={currentUser}
						/>
					)}
				</>
			)}

			{/* Auth Popup через UI Renderer Service */}
			<AuthPopup
				showPopup={showPopup}
				renderPopupConfig={renderPopupConfig}
				popupState={popupState}
				appIdValue={appIdValue}
				userIdValue={userIdValue}
				errorMessage={errorMessage}
				onAppIdChange={handleAppIdChange}
				onUserIdChange={handleUserIdChange}
				onAuthSubmit={handleAuthSubmit}
				onPopupClose={handlePopupClose}
			/>
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
