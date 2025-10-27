'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import { DynamicRenderer } from '../../../ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import type { AuthUIConfig, AuthPopupConfig, AppUser } from '../../domain/types';
import { ComponentNode } from '../../../ui-renderer/domain/value-objects/component-node.value-object';
import type { ThemeConfig } from '../../../ui-renderer/domain/value-objects/theme-config.value-object';

interface AuthModuleProps {
	children?: React.ReactNode;
	renderSidebarButton?: boolean;
	renderPopupConfig?: boolean;
}

// Функция для создания ComponentNode из JSON
const createComponentNode = (layout: any): ComponentNode => {
  const result = ComponentNode.create({
    id: layout.id,
    type: layout.type,
    props: layout.props || {},
    styles: layout.styles || {},
    children: layout.children || [],
    actions: layout.actions
  });
  
  if (result.isSuccess()) {
    return result.data;
  }
  
  // Fallback - создаем минимальный ComponentNode
  const fallbackResult = ComponentNode.create({
    id: layout.id || 'fallback',
    type: layout.type || 'Button',
    props: {},
    styles: {},
    children: []
  });
  
  if (fallbackResult.isSuccess()) {
    return fallbackResult.data;
  }
  
  // Если и fallback не работает, выбрасываем ошибку
  throw new Error('Failed to create ComponentNode');
};

// Функция для создания ThemeConfig из JSON
const createThemeConfig = (theme: any): ThemeConfig => ({
  colors: theme.colors || {},
  spacing: theme.spacing || [],
  equals: () => true
});

function AuthModuleContent({ children, renderSidebarButton = false, renderPopupConfig = false }: AuthModuleProps) {
	const searchParams = useSearchParams();
	const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState<AuthPopupConfig | null>(null);
  const [authUIConfig, setAuthUIConfig] = useState<AuthUIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

	// Загружаем UI конфигурацию один раз при монтировании
	useEffect(() => {
		const loadUIConfig = async () => {
			try {
				console.log('[AuthModule] Loading UI config...');
				const result = await authPresenter.loadAuthUI();
                if (result.status === 'success') {
                  setAuthUIConfig(result.config);
                  console.log('[AuthModule] UI config loaded successfully:', result.config);
                  console.log('[AuthModule] loginButton:', result.config?.loginButton);
                  console.log('[AuthModule] loginButton layout:', result.config?.loginButton?.layout);
                  console.log('[AuthModule] loginButton theme:', result.config?.loginButton?.theme);
                } else if (result.status === 'error') {
                  console.error('[AuthModule] Failed to load UI config:', result.error);
                }
			} catch (error) {
				console.error('[AuthModule] Error loading UI config:', error);
			}
		};

		loadUIConfig();
	}, []); // Убираем authPresenter из зависимостей

	// Подписываемся на изменения состояния авторизации через EventBus
	useEffect(() => {
		const checkAuth = () => {
			const authStatus = authPresenter.isUserAuthenticated();
			const user = authPresenter.getCurrentUser();
			console.log('[AuthModule] checkAuth called:', { 
				currentIsAuthenticated: isAuthenticated, 
				newAuthStatus: authStatus,
				shouldUpdate: authStatus !== isAuthenticated,
				currentUser: user,
				timestamp: new Date().toISOString()
			});
			if (authStatus !== isAuthenticated) {
				console.log('[AuthModule] Auth status changed:', { from: isAuthenticated, to: authStatus });
				setIsAuthenticated(authStatus);
				setCurrentUser(user);
			} else {
				console.log('[AuthModule] Auth status unchanged, no update needed');
			}
		};

		// Проверяем начальное состояние
		checkAuth();

		// Подписываемся на события авторизации
		const eventListener = (event: Event) => {
			const customEvent = event as CustomEvent;
			console.log('[AuthModule] authStateChanged event received:', customEvent.detail);
			console.log('[AuthModule] Event timestamp:', new Date().toISOString());
			checkAuth();
		};
		
		// Добавляем слушатель для событий авторизации
		window.addEventListener('authStateChanged', eventListener);

		return () => {
			window.removeEventListener('authStateChanged', eventListener);
		};
	}, []); // Убираем зависимости, чтобы избежать цикла

	// Подписка на событие showAuthPopup (для показа popup при попытке покупки)
	useEffect(() => {
		const handleShowAuthPopup = (event: Event) => {
			const customEvent = event as CustomEvent;
			console.log('[AuthModule] showAuthPopup event received:', customEvent.detail);
			setShowPopup(true);
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('showAuthPopup', handleShowAuthPopup);
			return () => window.removeEventListener('showAuthPopup', handleShowAuthPopup);
		}
	}, []);

	// Инициализация авторизации
	useEffect(() => {
		if (isAuthenticated) {
			console.log('[AuthModule] Already authenticated, skipping initialization');
			return;
		}

		// Приоритет: 1) Query параметр, 2) localStorage, 3) Environment variable
		const appId = getAppIdFromQuery() || getAppIdFromStorage() || getAppIdFromEnv();
		const userId = getUserIdFromQuery(); // НОВОЕ - извлекаем userId из query
		
		console.log('[AuthModule] Found appId:', appId, {
			fromQuery: getAppIdFromQuery(),
			fromStorage: getAppIdFromStorage(),
			fromEnv: getAppIdFromEnv(),
			userId: userId // НОВОЕ
		});
		
		if (!appId) {
			console.log('[AuthModule] No appId found, skipping initialization');
			return;
		}

		console.log('[AuthModule] Auto-initializing authentication', { appId, userId });
		setIsLoading(true);
		authPresenter.initializeAuthentication(appId, userId || undefined).finally(() => {
			setIsLoading(false);
		});

	}, [searchParams]); // Только searchParams, остальные могут вызывать цикл

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

	const getAppIdFromEnv = () => {
		return process.env.NEXT_PUBLIC_APP_ID || null;
	};


	const handleLoginClick = () => {
		console.log('[AuthModule] Login button clicked, showing popup');
		if (authUIConfig?.loginPopup) {
			setPopupConfig(authUIConfig.loginPopup);
			console.log('[AuthModule] Popup config set from cached UI config');
		} else {
			console.error('[AuthModule] No UI config available for popup');
		}
	};

	const handleAuthPopupClose = () => {
		setShowPopup(false);
	};

	const handleAuthSuccess = () => {
		console.log('[AuthModule] handleAuthSuccess called');
		console.log('[AuthModule] Current isAuthenticated state:', isAuthenticated);
		console.log('[AuthModule] AuthPresenter.isUserAuthenticated():', authPresenter.isUserAuthenticated());
		
		setShowPopup(false);
		setPopupConfig(null); // Закрываем popup
		
		// Принудительно проверяем состояние авторизации
		const currentAuthStatus = authPresenter.isUserAuthenticated();
		const user = authPresenter.getCurrentUser();
		if (currentAuthStatus !== isAuthenticated) {
			console.log('[AuthModule] Auth status mismatch detected, updating state:', { from: isAuthenticated, to: currentAuthStatus });
			setIsAuthenticated(currentAuthStatus);
			setCurrentUser(user);
		}
		
		// AuthPresenter уже обновил состояние через EventBus
	};

	const handleAuthSubmit = async (e: React.FormEvent) => {
		console.log('[AuthModule] Auth submit called');

		// Для popup используем фиксированный appId для тестирования
		const appId = 'APP123';

		if (!appId?.trim()) {
			console.error('[AuthModule] No appId provided');
			return;
		}

		// Устанавливаем loading состояние
		setIsLoading(true);
		console.log('[AuthModule] Loading state set to true');

		try {
			console.log('[AuthModule] Starting authentication with appId:', appId);
			
			// Добавляем небольшую задержку для демонстрации loading
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			const result = await authPresenter.initializeAuthentication(appId.trim());

			if (result.status === 'success') {
				console.log('[AuthModule] Authentication successful');
				handleAuthSuccess();
			} else {
				console.error('[AuthModule] Authentication failed:', result.error);
			}
		} catch (error) {
			console.error('[AuthModule] Authentication error:', error);
		} finally {
			// Сбрасываем loading состояние
			setIsLoading(false);
			console.log('[AuthModule] Loading state set to false');
		}
	};

  const handlePopupOpen = (config: AuthPopupConfig) => {
    setPopupConfig(config);
  };

	const handlePopupConfigClose = () => {
		setPopupConfig(null);
	};

	const handleAppIdChange = (value: string) => {
		// App ID изменение обрабатывается в AuthLoginButton
		console.log('[AuthModule] App ID changed:', value);
	};

	return (
		<>
			{children}

      {/* Auth UI Components - sidebar кнопка или информация о пользователе */}
      {renderSidebarButton && (
        <>
          {!isAuthenticated && authUIConfig?.loginButton?.layout ? (
            <>
              {console.log('[AuthModule] Rendering sidebar button with config:', {
                renderSidebarButton,
                isAuthenticated,
                hasAuthUIConfig: !!authUIConfig,
                hasLoginButton: !!authUIConfig?.loginButton,
                hasLayout: !!authUIConfig?.loginButton?.layout,
                layout: authUIConfig?.loginButton?.layout,
                timestamp: new Date().toISOString()
              })}
              <DynamicRenderer 
                node={createComponentNode(authUIConfig?.loginButton?.layout)} 
                theme={createThemeConfig(authUIConfig?.loginButton?.theme)}
  					actionContext={{
  						onPopupOpen: handlePopupOpen,
  						onPopupClose: handlePopupConfigClose,
  						handleAuthSubmit: handleAuthSubmit,
  						handleAppIdChange: handleAppIdChange,
  						onLoginClick: handleLoginClick,
  						isLoading: isLoading,
  					}}
  				/>
            </>
          ) : isAuthenticated && currentUser ? (
            <>
              {console.log('[AuthModule] Rendering user info:', {
                isAuthenticated,
                currentUser,
                timestamp: new Date().toISOString()
              })}
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {currentUser.username}
                    </h3>
                    <p className="text-sm text-white">
                      App ID: {currentUser.appId}
                    </p>
                    <p className="text-xs text-green-400 font-medium">
                      ✓ Авторизован
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
			)}

			{/* Auth UI Components - popup config */}
			{renderPopupConfig && popupConfig?.layout && (
				<DynamicRenderer
					node={createComponentNode(popupConfig.layout)}
					theme={createThemeConfig(popupConfig.theme)}
					actionContext={{
						onPopupOpen: handlePopupOpen,
						onPopupClose: handlePopupConfigClose,
						handleAuthSubmit: handleAuthSubmit,
						handleAppIdChange: handleAppIdChange,
						isLoading: isLoading,
					}}
				/>
			)}
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

