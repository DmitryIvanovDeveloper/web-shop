'use client';

import { container } from '../src/infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../src/modules/ui-renderer/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/ui-renderer/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/sidebar-renderer';
import { LoadPageConfigUseCase } from '../src/modules/ui-renderer/application/use-cases/load-page-config.use-case';
import { DynamicRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import type { ActionContext } from '../src/modules/ui-renderer/domain/types';
import { useState, useEffect } from 'react';

export default function HomePage(): JSX.Element {
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    UI_RENDERER_TYPES.SidebarRendererPresenter
  );
  
  const loadConfigUseCase = container.get<LoadPageConfigUseCase>(
    UI_RENDERER_TYPES.LoadPageConfigUseCase
  );
  
  const [mainContentConfig, setMainContentConfig] = useState<any>(null);
  const [rightSidebarConfig, setRightSidebarConfig] = useState<any>(null);
  const [popupConfig, setPopupConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ActionContext для обработки действий
  const actionContext: ActionContext = {
    onPopupOpen: (config) => {
      console.log('[HomePage] Opening popup with config:', config);
      setPopupConfig(config);
    },
    onPopupClose: () => {
      console.log('[HomePage] Closing popup');
      setPopupConfig(null);
    },
  };
  
  console.log('[HomePage] ActionContext created:', actionContext);
  console.log('[HomePage] onPopupOpen exists:', !!actionContext.onPopupOpen);
  
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // Load main content
        console.log('[HomePage] Loading main-content config...');
        const mainResult = await loadConfigUseCase.execute({ pageType: 'main-content' });
        console.log('[HomePage] Main content load result:', mainResult);
        if (mainResult.isSuccess()) {
          console.log('[HomePage] Main content data:', mainResult.data);
          setMainContentConfig(mainResult.data);
        } else {
          console.error('[HomePage] Failed to load main content:', mainResult.error);
          setError(mainResult.error?.message || 'Failed to load main content');
        }

        // Load right sidebar
        console.log('[HomePage] Loading right-sidebar config...');
        const rightResult = await loadConfigUseCase.execute({ pageType: 'right-sidebar' });
        console.log('[HomePage] Right sidebar load result:', rightResult);
        if (rightResult.isSuccess()) {
          console.log('[HomePage] Right sidebar data:', rightResult.data);
          setRightSidebarConfig(rightResult.data);
        } else {
          console.error('[HomePage] Failed to load right sidebar:', rightResult.error);
        }
      } catch (err) {
        console.error('[HomePage] Exception loading configs:', err);
        setError(String(err));
      }
    };
    loadConfigs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} />
      <main className="flex-1 overflow-y-auto h-screen">
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
            actionContext={actionContext}
          />
        )}
      </main>
      {/* Right Sidebar */}
      <aside>
        {rightSidebarConfig && (
          <>
            {console.log('[HomePage] Rendering right sidebar with actionContext:', actionContext)}
            <DynamicRenderer 
              node={rightSidebarConfig.layout} 
              theme={rightSidebarConfig.theme}
              actionContext={actionContext}
            />
          </>
        )}
      </aside>
      {/* Popup */}
      {popupConfig && (
        <DynamicRenderer 
          node={popupConfig.layout} 
          theme={popupConfig.theme}
          actionContext={actionContext}
        />
      )}
    </div>
  );
}