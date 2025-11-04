'use client';

import React, { useEffect, useState } from 'react';
import { SectionRenderer } from './section-renderer';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PAGE_RENDERER_TYPES } from '../../../infrastructure/bootstrap/types';
import { LoadPageConfigUseCase } from '../../../application/use-cases/load-page-config.use-case';
import { LoadPageConfigFromMessageUseCase } from '../../../application/use-cases/load-page-config-from-message.use-case';
import { PageRendererPresenter } from '../../presenters/page-renderer.presenter';
import type { PageRendererViewModel } from '../../view-models/page-renderer.view-model';

interface PageRendererProps {
  appId: string;
  pageSlug?: string;
  theme: any;
  previewMode?: boolean;
}

export function PageRenderer({ appId, pageSlug = 'home', theme, previewMode = false }: PageRendererProps): JSX.Element {
  const [vm, setVm] = useState<PageRendererViewModel>({
    sections: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadUseCase = container.get<LoadPageConfigUseCase>(PAGE_RENDERER_TYPES.LoadPageConfigUseCase);

    // Подписываемся на изменения ViewModel
    const unsubscribe = presenter.subscribe((newVm) => {
      setVm(newVm);
    });

    // Инициализируем загрузку данных
    presenter.setLoading(true);
    loadUseCase.execute({ appId, pageSlug, previewMode }).then((result) => {
      if (!result.isSuccess) {
        presenter.setError(result.error?.message || 'Failed to load page config');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [appId, pageSlug, previewMode]);

  // Handle preview updates from UI Builder via postMessage
  useEffect(() => {
    if (!previewMode) return;

    const loadFromMessageUseCase = container.get<LoadPageConfigFromMessageUseCase>(
      PAGE_RENDERER_TYPES.LoadPageConfigFromMessageUseCase
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'PAGE_CONFIG_UPDATE') {
        try {
          await loadFromMessageUseCase.execute(
            event.data.config,
            appId,
            pageSlug
          );
        } catch (error) {
          console.error('[PageRenderer] Failed to process config update from message', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [previewMode, appId, pageSlug]);

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{vm.error}</p>
        </div>
      </div>
    );
  }

  if (vm.sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500">
          <p>No content available</p>
        </div>
      </div>
    );
  }

  const pageStyle: React.CSSProperties = {
    padding: vm.pageStyles?.padding || undefined,
    gap: vm.pageStyles?.gap || undefined,
    display: vm.pageStyles?.gap ? 'flex' : undefined,
    flexDirection: vm.pageStyles?.gap ? 'column' : undefined,
  };

  return (
    <div className="page-renderer" style={pageStyle}>
      {vm.sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          theme={theme}
        />
      ))}
    </div>
  );
}

