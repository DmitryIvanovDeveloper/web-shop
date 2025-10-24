'use client';

import { container } from '../src/infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../src/modules/ui-renderer/infrastructure/bootstrap/types';
import { LoadPageConfigUseCase } from '../src/modules/ui-renderer/application/use-cases/load-page-config.use-case';
import { DynamicRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import type { ActionContext } from '../src/modules/ui-renderer/domain/types';
import { useState, useEffect } from 'react';

export default function HomePage(): JSX.Element {
  const loadConfigUseCase = container.get<LoadPageConfigUseCase>(
    UI_RENDERER_TYPES.LoadPageConfigUseCase
  );
  
  const [mainContentConfig, setMainContentConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ActionContext для обработки действий
  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
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
      } catch (err) {
        setError(String(err));
      }
    };
    loadConfigs();
  }, []);

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto">
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
    </>
  );
}