'use client';

import { container } from '../../src/infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../../src/modules/ui-renderer/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../../src/modules/ui-renderer/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../../src/modules/ui-renderer/interface-adapters/ui/components/sidebar-renderer';
import { LoadPageConfigUseCase } from '../../src/modules/ui-renderer/application/use-cases/load-page-config.use-case';
import { DynamicRenderer } from '../../src/modules/ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import { useState, useEffect } from 'react';

export default function UIRendererDemoPage(): JSX.Element {
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    UI_RENDERER_TYPES.SidebarRendererPresenter
  );
  
  const loadConfigUseCase = container.get<LoadPageConfigUseCase>(
    UI_RENDERER_TYPES.LoadPageConfigUseCase
  );
  
  const [mainContentConfig, setMainContentConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadMainContent = async () => {
      try {
        console.log('[UIRendererDemo] Loading main-content config...');
        const result = await loadConfigUseCase.execute({ pageType: 'main-content' });
        console.log('[UIRendererDemo] Config load result:', result);
        if (result.isSuccess()) {
          console.log('[UIRendererDemo] Config data:', result.data);
          setMainContentConfig(result.data);
        } else {
          console.error('[UIRendererDemo] Failed to load config:', result.error);
          setError(result.error?.message || 'Failed to load config');
        }
      } catch (err) {
        console.error('[UIRendererDemo] Exception loading config:', err);
        setError(String(err));
      }
    };
    loadMainContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <SidebarRenderer presenter={sidebarPresenter} />
      <main className="flex-1">
        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}
        {!mainContentConfig && !error && (
          <div className="text-white">
            Loading main content...
          </div>
        )}
        {mainContentConfig && (
          <DynamicRenderer 
            node={mainContentConfig.layout} 
            theme={mainContentConfig.theme} 
          />
        )}
      </main>
      {/* Right Sidebar */}
      <div className="w-64 bg-gray-800 border-l border-gray-700">
        {/* Empty right sidebar */}
      </div>
    </div>
  );
}

