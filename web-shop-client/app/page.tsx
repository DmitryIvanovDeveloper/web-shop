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

  // Apply background styles from JSON config to body
  useEffect(() => {
    if (mainContentConfig?.layout?.styles) {
      const styles = mainContentConfig.layout.styles;
      
      if (styles.backgroundImage) {
        document.body.style.backgroundImage = styles.backgroundImage;
      }
      
      if (styles.backgroundSize) {
        document.body.style.backgroundSize = styles.backgroundSize;
      }
      
      if (styles.backgroundPosition) {
        document.body.style.backgroundPosition = styles.backgroundPosition;
      }
      
      if (styles.backgroundRepeat) {
        document.body.style.backgroundRepeat = styles.backgroundRepeat;
      }

      // Set min height to ensure background covers full viewport
      document.body.style.minHeight = '100vh';
    }

    // Cleanup function to reset body styles when component unmounts
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.minHeight = '';
    };
  }, [mainContentConfig]);

  return (
    <>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full mx-auto" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
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