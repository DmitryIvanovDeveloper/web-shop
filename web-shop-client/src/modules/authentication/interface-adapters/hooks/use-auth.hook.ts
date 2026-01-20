

import { useState, useEffect, useCallback } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../presenters/auth.presenter';
import { AuthViewModel } from '../view-models/auth.view-model';
import type { AppUser } from '../../domain/types';
import type { SessionStoragePort } from '../../application/ports/session-storage.port';

export interface UseAuthOptions {
  
  checkInterval?: number;
  
  autoInitialize?: boolean;
}

export interface UseAuthReturn {
  
  viewModel: AuthViewModel;
  
  isAuthenticated: boolean;
  
  currentUser: AppUser | null;
  
  initializeAuth: (appId: string, userId: string) => Promise<AuthViewModel>;
  
  logout: () => void;
  
  refresh: () => void;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { 
    checkInterval = 100, 
    autoInitialize = false 
  } = options;

    const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
  const sessionStorage = container.get<SessionStoragePort>(AUTH_TYPES.SessionStoragePort);

  const [viewModel, setViewModel] = useState<AuthViewModel>(() => authPresenter.presentIdle());

    const refresh = useCallback(() => {
    const currentViewModel = authPresenter.getCurrentViewModel();
        console.log('[useAuth] refresh - isAuthenticated:', authPresenter.isUserAuthenticated());
    setViewModel(currentViewModel);
  }, [authPresenter]);

    useEffect(() => {
    refresh();
    
    const interval = setInterval(() => {
      const updatedViewModel = authPresenter.getCurrentViewModel();
      const currentIsAuthenticated = authPresenter.isUserAuthenticated();
      
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

    const initializeAuth = useCallback(async (appId: string, userId: string): Promise<AuthViewModel> => {
    const result = await authPresenter.tryAuthenticate(appId, userId);
    refresh();
    return result;
  }, [authPresenter, refresh]);

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
