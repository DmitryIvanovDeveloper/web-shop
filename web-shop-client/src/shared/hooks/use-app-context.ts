'use client';

import { useState, useEffect } from 'react';

import { container } from '../../infrastructure/bootstrap/container';
import { TYPES } from '../../infrastructure/bootstrap/types';
import type { GetAppContextUseCase } from '../../application/use-cases/get-app-context.use-case';

interface AppContext {
  appId: string;
  merchantId: string | null;
}


export function useAppContext(): AppContext {
  const [context, setContext] = useState<AppContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const useCase = container.get<GetAppContextUseCase>(TYPES.GetAppContext);
      const appContext = useCase.execute();
      setContext(appContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  if (error) {
        return {
      appId: '',
      merchantId: null,
      error
    } as any;
  }

  if (!context) {
        return {
      appId: '',
      merchantId: null,
      loading: true
    } as any;
  }

  return context;
}


export function useAppId(): string | null {
  const { appId, error, loading } = useAppContext() as any;

  if (loading) {
    return null;
  }

  if (error != null || appId == null) {
    return null;
  }

  return appId;
}
