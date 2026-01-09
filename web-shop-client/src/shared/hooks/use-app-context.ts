'use client';

import { useState, useEffect } from 'react';
import { container } from '../../infrastructure/bootstrap/container';
import { TYPES } from '../../infrastructure/bootstrap/types';
import type { GetAppContextUseCase } from '../../application/use-cases/get-app-context.use-case';

interface AppContext {
  appId: string;
  merchantId: string | null;
}

/**
 * React hook for accessing application context
 * Provides appId and merchantId from URL parameters
 *
 * @throws Error if appId is not available in URL
 */
export function useAppContext(): AppContext {
  const [context, setContext] = useState<AppContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useAppContext] Initializing...');
    try {
      console.log('[useAppContext] Getting use case from container...');
      const useCase = container.get<GetAppContextUseCase>(TYPES.GetAppContext);
      console.log('[useAppContext] Executing use case...');
      const appContext = useCase.execute();
      console.log('[useAppContext] Use case executed successfully:', appContext);
      setContext(appContext);
    } catch (err) {
      console.error('[useAppContext] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  if (error) {
    console.log('[useAppContext] Returning error state:', error);
    // Render error UI instead of throwing
    return {
      appId: '',
      merchantId: null,
      error
    } as any;
  }

  if (!context) {
    console.log('[useAppContext] Returning loading state');
    // Still loading
    return {
      appId: '',
      merchantId: null,
      loading: true
    } as any;
  }

  console.log('[useAppContext] Returning context:', context);
  return context;
}

/**
 * Convenience hook for getting just the appId
 * Returns null if appId is not available yet (loading/error state)
 */
export function useAppId(): string | null {
  const { appId, error, loading } = useAppContext() as any;

  console.log('[useAppId] Hook called', { appId, error, loading });

  if (loading) {
    console.log('[useAppId] Returning null - loading state');
    return null; // Don't throw error, return null for loading state
  }

  if (error || !appId) {
    console.log('[useAppId] Returning null - error or no appId', { error, appId });
    return null; // Don't throw error, return null for error/missing state
  }

  console.log('[useAppId] Returning appId:', appId);
  return appId;
}
