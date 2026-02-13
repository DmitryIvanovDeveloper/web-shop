'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
	
		const [viewModel, setViewModel] = useState<AuthViewModel>(() => authPresenter.viewModel);
	const [showPopup, setShowPopup] = useState(false);
	const [popupState, setPopupState] = useState<PopupState>('idle');
	const [appIdValue, setAppIdValue] = useState('');
	const [userIdValue, setUserIdValue] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isConfigReady, setIsConfigReady] = useState(false);
	
		const isAuthenticated = viewModel.status === 'success' && !!viewModel.user;
	const currentUser = viewModel.user || null;
	const isAuthenticating = viewModel.status === 'loading';

	const handleShowAuthPopup = useCallback(() => {
						const userIdFromQuery = searchParams.get('userId');
		const appIdFromQuery = searchParams.get('appId');
		
				setShowPopup(true);
		setPopupState('idle');
		setErrorMessage(null);
		
				setUserIdValue(userIdFromQuery || '');
		setAppIdValue(appIdFromQuery || '');
	}, [searchParams]);

	const handleCloseAuthPopup = useCallback(() => {
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
		useEffect(() => {
				const ready = authPresenter.isConfigReady();
		if (ready !== isConfigReady) {
						setIsConfigReady(ready);
		}

				const handleConfigLoaded = () => {
						setIsConfigReady(true);
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('appConfigLoaded', handleConfigLoaded);
			return () => window.removeEventListener('appConfigLoaded', handleConfigLoaded);
		}
	}, [authPresenter, isConfigReady]);

		useEffect(() => {
						const unsubscribe = authPresenter.subscribe((newViewModel) => {
						setViewModel(newViewModel);
		});

		return unsubscribe;
	}, [authPresenter]);

		useEffect(() => {
						(async () => {
						const appId = getAppIdFromQuery();
			const userId = getUserIdFromQuery();
									const appIdFromStorage = appId || (await getAppIdFromStorage());
			const userIdFromStorage = userId || (await getUserIdFromStorage());
						if (!appIdFromStorage || !userIdFromStorage) {
												return;
			}

			try {
												const result = await authPresenter.tryAuthenticate(appIdFromStorage, userIdFromStorage);
							} catch (error) {
											}
		})();

	}, [searchParams, authPresenter, sessionStorage]);

	const getAppIdFromQuery = () => searchParams.get('appId') || searchParams.get('app');
	const getUserIdFromQuery = () => searchParams.get('userId');
	
		const getAppIdFromStorage = async () => {
		const result = await sessionStorage.load();
		if (result.isSuccess && result.value) {
			return result.value.appId;
		}
		return null;
	};

	const getUserIdFromStorage = async () => {
		const result = await sessionStorage.load();
		if (result.isSuccess && result.value) {
			return result.value.userId;
		}
		return null;
	};

		const handleLoginClick = () => {
				setShowPopup(true);
		setPopupState('idle');
		setAppIdValue('');
		setUserIdValue('');
		setErrorMessage(null);
	};

		const handleAppIdChange = (value: string) => {
				setAppIdValue(value);
				if (errorMessage) {
			setErrorMessage(null);
		}
	};

		const handleUserIdChange = (value: string) => {
				setUserIdValue(value);
				if (errorMessage) {
			setErrorMessage(null);
		}
	};

		const handleAuthSubmit = async () => {
				if (!appIdValue?.trim()) {
						setPopupState('error');
			setErrorMessage('Please enter App ID');
			return;
		}

		if (!userIdValue?.trim()) {
						setPopupState('error');
			setErrorMessage('Please enter User ID');
			return;
		}

		setPopupState('loading');
				try {
						await new Promise(resolve => setTimeout(resolve, 800));
			
			const result = await authPresenter.tryAuthenticate(appIdValue.trim(), userIdValue.trim());

			if (result.status === 'success') {
								setPopupState('success');
				
								setTimeout(() => {
					setShowPopup(false);
					setPopupState('idle');
					setAppIdValue('');
					setUserIdValue('');
					setErrorMessage(null);
				}, 1500);
			} else {
								setPopupState('error');
				setErrorMessage(result.error?.message || 'Authentication failed. Please try again.');
			}
		} catch (error) {
						setPopupState('error');
			setErrorMessage('An unexpected error occurred. Please try again.');
		}
	};

		const handlePopupClose = () => {
				setShowPopup(false);
		setPopupState('idle');
		setAppIdValue('');
		setUserIdValue('');
		setErrorMessage(null);
	};





			return (
		<>
	
			{children}

			{}
			{isAuthenticating && renderSidebarButton && (
				<AuthSkeleton />
			)}

			{}
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

			{}
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
