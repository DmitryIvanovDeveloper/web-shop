/**
 * Переиспользуемый хук для работы с авторизацией
 * Предоставляет состояние и методы для управления авторизацией
 */

import { useState, useEffect, useCallback } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import { AuthViewModel } from '../view-models/auth.view-model';
import type { AppUser } from '../../domain/types';
import type { SessionStoragePort } from '../../application/ports/session-storage.port';

export interface UseAuthOptions {
  /** Интервал проверки состояния (по умолчанию 100ms) */
  checkInterval?: number;
  /** Автоматически инициализировать авторизацию при монтировании */
  autoInitialize?: boolean;
}

export interface UseAuthReturn {
  /** Текущее состояние авторизации */
  viewModel: AuthViewModel;
  /** Проверка авторизации пользователя */
  isAuthenticated: boolean;
  /** Текущий пользователь */
  currentUser: AppUser | null;
  /** Инициализация авторизации по App ID и User ID */
  initializeAuth: (appId: string, userId: string) => Promise<AuthViewModel>;
  /** Сброс авторизации */
  logout: () => void;
  /** Обновление состояния вручную */
  refresh: () => void;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { 
    checkInterval = 100, 
    autoInitialize = false 
  } = options;

  // Получаем presenter и sessionStorage из DI контейнера
  const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
  const sessionStorage = container.get<SessionStoragePort>(AUTH_TYPES.SessionStoragePort);

  const [viewModel, setViewModel] = useState<AuthViewModel>(() => authPresenter.presentIdle());

  // Обновляем состояние из presenter
  const refresh = useCallback(() => {
    const currentViewModel = authPresenter.getCurrentViewModel();
    console.log('[useAuth] refresh - currentViewModel:', currentViewModel);
    console.log('[useAuth] refresh - isAuthenticated:', authPresenter.isUserAuthenticated());
    setViewModel(currentViewModel);
  }, [authPresenter]);

  // Отслеживаем изменения состояния presenter
  useEffect(() => {
    refresh();
    
    const interval = setInterval(() => {
      const updatedViewModel = authPresenter.getCurrentViewModel();
      const currentIsAuthenticated = authPresenter.isUserAuthenticated();
      
      // Обновляем состояние если изменился статус или авторизация
      setViewModel(prevViewModel => {
        const prevIsAuthenticated = prevViewModel.status === 'success' && prevViewModel.user;
        
        if (updatedViewModel.status !== prevViewModel.status || 
            currentIsAuthenticated !== prevIsAuthenticated) {
          return updatedViewModel;
        }
        
        return prevViewModel;
      });
    }, checkInterval);
    
    return () => clearInterval(interval);
  }, [authPresenter, checkInterval, refresh]);

  // Инициализация авторизации
  const initializeAuth = useCallback(async (appId: string, userId: string): Promise<AuthViewModel> => {
    const result = await authPresenter.tryAuthenticate(appId, userId);
    refresh();
    return result;
  }, [authPresenter, refresh]);

  // Сброс авторизации
  const logout = useCallback(async () => {
    authPresenter.setUnauthenticated();
    await sessionStorage.clear();
    refresh();
  }, [authPresenter, sessionStorage, refresh]);

  return {
    viewModel,
    isAuthenticated: authPresenter.isUserAuthenticated(),
    currentUser: authPresenter.getCurrentUser(),
    initializeAuth,
    logout,
    refresh
  };
}
