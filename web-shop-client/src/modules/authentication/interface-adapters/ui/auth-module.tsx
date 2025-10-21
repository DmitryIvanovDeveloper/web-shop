'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { container } from '../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import { DynamicRenderer } from '../../../ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import type { AuthUIConfig, AuthPopupConfig } from '../../domain/types';
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

export function AuthModule({ children, renderSidebarButton = false, renderPopupConfig = false }: AuthModuleProps) {
	const searchParams = useSearchParams();
	const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState<AuthPopupConfig | null>(null);
  const [authUIConfig, setAuthUIConfig] = useState<AuthUIConfig | null>(null);

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
			console.log('[AuthModule] checkAuth called:', { 
				currentIsAuthenticated: isAuthenticated, 
				newAuthStatus: authStatus,
				shouldUpdate: authStatus !== isAuthenticated
			});
			if (authStatus !== isAuthenticated) {
				console.log('[AuthModule] Auth status changed:', { from: isAuthenticated, to: authStatus });
				setIsAuthenticated(authStatus);
			}
		};

		// Проверяем начальное состояние
		checkAuth();

		// Подписываемся на события авторизации
		const eventListener = (event: Event) => {
			const customEvent = event as CustomEvent;
			console.log('[AuthModule] authStateChanged event received:', customEvent.detail);
			checkAuth();
		};
		
		// Добавляем слушатель для событий авторизации
		window.addEventListener('authStateChanged', eventListener);

		return () => {
			window.removeEventListener('authStateChanged', eventListener);
		};
	}, []); // Убираем зависимости, чтобы избежать цикла

	// Инициализация авторизации
	useEffect(() => {
		if (isAuthenticated) {
			console.log('[AuthModule] Already authenticated, skipping initialization');
			return;
		}

		const appId = getAppIdFromQuery() || getAppIdFromStorage();
		console.log('[AuthModule] Found appId:', appId);
		if (!appId) {
			console.log('[AuthModule] No appId found, skipping initialization');
			return;
		}

		console.log('[AuthModule] Initializing authentication with appId:', appId);
		authPresenter.initializeAuthentication(appId);

	}, [searchParams]); // Только searchParams, остальные могут вызывать цикл

	const getAppIdFromQuery = () => searchParams.get('appId');
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
		setShowPopup(false);
		setPopupConfig(null); // Закрываем popup
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

		try {
			console.log('[AuthModule] Starting authentication with appId:', appId);
			const result = await authPresenter.initializeAuthentication(appId.trim());

			if (result.status === 'success') {
				console.log('[AuthModule] Authentication successful');
				handleAuthSuccess();
			} else {
				console.error('[AuthModule] Authentication failed:', result.error);
			}
		} catch (error) {
			console.error('[AuthModule] Authentication error:', error);
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

      {/* Auth UI Components - sidebar кнопка */}
      {renderSidebarButton && !isAuthenticated && authUIConfig?.loginButton?.layout && (
        <>
          {console.log('[AuthModule] Rendering sidebar button with config:', {
            renderSidebarButton,
            isAuthenticated,
            hasAuthUIConfig: !!authUIConfig,
            hasLoginButton: !!authUIConfig?.loginButton,
            hasLayout: !!authUIConfig?.loginButton?.layout,
            layout: authUIConfig?.loginButton?.layout
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
					}}
				/>
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
					}}
				/>
			)}
		</>
	);
}

