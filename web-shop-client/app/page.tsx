'use client';

import { container } from '../src/infrastructure/bootstrap/container';
import { APP_LAYOUT_TYPES } from '../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext } from '../src/shared/ui/action-context';
import { useEffect } from 'react';

export default function HomePage(): JSX.Element {
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

  // ActionContext для обработки действий
  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
  };

  // Apply background styles from JSON config to body
  useEffect(() => {
    const storeConfig = sidebarPresenter.getStore();
    
    if (storeConfig?.layout?.styles) {
      const styles = storeConfig.layout.styles;
      
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

    // Notify parent window (UI Builder) that preview is ready
    if (typeof window !== 'undefined' && window.parent !== window) {
      const targetOrigin = process.env.NEXT_PUBLIC_UI_BUILDER_URL || '*';
      window.parent.postMessage({ type: 'PREVIEW_READY' }, targetOrigin);
      console.log('[HomePage] Sent PREVIEW_READY to parent');
    }

    // Cleanup function to reset body styles when component unmounts
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.minHeight = '';
    };
  }, [sidebarPresenter]);

  return (
    <main className="flex-1 overflow-y-auto w-full mx-auto" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
      <SidebarRenderer 
        presenter={sidebarPresenter} 
        layoutType="store"
        actionContext={actionContext}
      />
    </main>
  );
}