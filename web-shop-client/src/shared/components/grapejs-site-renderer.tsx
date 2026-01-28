import React, { useEffect, useState } from 'react';
import { GrapeJsRenderer } from './grapejs-renderer';
import type { GrapeJsAppConfig } from '../config/grapejs-app-config.types';
import { LoadGrapeJsConfigUseCase } from '../../application/use-cases/load-grapejs-config.use-case';
import { container } from '../../infrastructure/bootstrap/container';
import { TYPES } from '../../infrastructure/bootstrap/types';

interface GrapeJsSiteRendererProps {
  appId: string;
  className?: string;
}

export function GrapeJsSiteRenderer({ appId, className = '' }: GrapeJsSiteRendererProps) {
  const [grapeJsConfig, setGrapeJsConfig] = useState<GrapeJsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrapeJsConfig();
  }, [appId]);

  const loadGrapeJsConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[GrapeJsSiteRenderer] Loading config for appId:', appId);

      // Используем новый use-case для загрузки GrapeJS конфигурации
      const loadGrapeJsConfigUseCase = container.get<LoadGrapeJsConfigUseCase>(TYPES.LoadGrapeJsConfig);
      const config = await loadGrapeJsConfigUseCase.execute(false, appId); // false = active config

      console.log('[GrapeJsSiteRenderer] Config loaded:', {
        hasConfig: !!config,
        pagesCount: config.pages?.length || 0,
        stylesCount: config.styles?.length || 0,
        firstPageFrames: config.pages?.[0]?.frames?.length || 0,
        stylesSample: config.styles?.slice(0, 3) || []
      });

      // Логируем структуру первого компонента
      const rootComponent = config.pages?.[0]?.frames?.[0]?.component;
      if (rootComponent) {
        console.log('[GrapeJsSiteRenderer] Root component structure:', {
          type: rootComponent.type,
          tagName: rootComponent.tagName,
          classes: rootComponent.classes,
          attributes: rootComponent.attributes,
          componentsCount: rootComponent.components?.length || 0,
          hasProps: !!rootComponent.props,
          hasActions: !!rootComponent.actions,
          fullStructure: JSON.stringify(rootComponent, null, 2).substring(0, 500) + '...'
        });
      }

      // Логируем все стили
      console.log('[GrapeJsSiteRenderer] All styles:', config.styles?.map((style, index) => ({
        index,
        selectors: style.selectors,
        selectorsAdd: style.selectorsAdd,
        styleKeys: Object.keys(style.style || {}),
        styleSample: JSON.stringify(style.style).substring(0, 100) + '...'
      })) || []);

      setGrapeJsConfig(config);
    } catch (err) {
      console.error('[GrapeJsSiteRenderer] Error loading config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`grapejs-site-renderer ${className} flex items-center justify-center min-h-screen bg-gray-100`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grapejs-site-renderer ${className} flex items-center justify-center min-h-screen bg-gray-100`}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Configuration</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadGrapeJsConfig}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!grapeJsConfig) {
    return (
      <div className={`grapejs-site-renderer ${className} flex items-center justify-center min-h-screen bg-gray-100`}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Configuration Found</h2>
          <p className="text-gray-600">Configuration not found for app ID: {appId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grapejs-site-renderer ${className}`}>
      <GrapeJsRenderer grapeJsConfig={grapeJsConfig} />
    </div>
  );
}