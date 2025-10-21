'use client';

import { container } from '../src/infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../src/modules/ui-renderer/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/ui-renderer/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/sidebar-renderer';
import { LoadPageConfigUseCase } from '../src/modules/ui-renderer/application/use-cases/load-page-config.use-case';
import { DynamicRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import type { ActionContext } from '../src/modules/ui-renderer/domain/types';
import { useState, useEffect } from 'react';
import { AuthModule } from '@/modules/authentication/interface-adapters/ui/auth-module';

export default function HomePage(): JSX.Element {
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    UI_RENDERER_TYPES.SidebarRendererPresenter
  );
  
  const loadConfigUseCase = container.get<LoadPageConfigUseCase>(
    UI_RENDERER_TYPES.LoadPageConfigUseCase
  );
  
  
  const [mainContentConfig, setMainContentConfig] = useState<any>(null);
  const [rightSidebarConfig, setRightSidebarConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ActionContext для обработки действий
  const actionContext: ActionContext = {
    onPopupOpen: () => {}, // Empty handlers since popup is managed by AuthModule
    onPopupClose: () => {}, // Empty handlers since popup is managed by AuthModule
  };
  
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // Load main content
        const mainResult = await Promise.race([
          loadConfigUseCase.execute({ pageType: 'main-content' }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Main content load timeout')), 10000)
          )
        ]) as any;
        if (mainResult.isSuccess()) {
          setMainContentConfig(mainResult.data);
        } else {
          setError(mainResult.error?.message || 'Failed to load main content');
        }

        // Load right sidebar
        const rightResult = await loadConfigUseCase.execute({ pageType: 'right-sidebar' });
        if (rightResult.isSuccess()) {
          setRightSidebarConfig(rightResult.data);
        }
      } catch (err) {
        setError(String(err));
      }
    };
    loadConfigs();
  }, []);

  return (
    <>
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
      <aside className="w-80 border-l border-yellow-400/30 p-4 bg-gray-800">
        <div className="mb-4">
         <AuthModule renderSidebarButton={true} renderPopupConfig={true} /> {/* AuthLoginButton и popup config рендерятся через AuthModule */}
        </div>
        
        {rightSidebarConfig && (
          <DynamicRenderer 
            node={rightSidebarConfig.layout} 
            theme={rightSidebarConfig.theme}
            actionContext={actionContext}
          />
        )}
      </aside>
      {/* Popup рендерится через AuthModule */}
    </>
  );
}