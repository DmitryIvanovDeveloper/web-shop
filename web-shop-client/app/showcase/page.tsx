'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OffersList } from '@/modules/offers/interface-adapters/ui/components/offers-list';
import { ProductsList } from '@/modules/products/interface-adapters/ui/components/products-list';
import { AuthModule } from '@/modules/authentication/interface-adapters/ui/auth-module';

function ShowcaseContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');
  const previewMode = searchParams.get('previewMode') === 'true';

  useEffect(() => {
    if (!previewMode) return;

    console.log('[Showcase] Preview mode enabled, listening for theme updates');

    // Notify parent (UI Builder) that preview is ready to receive initial state
    try {
      const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL;
      const isDev = !builderOrigin || builderOrigin.startsWith('http://localhost:');
      const targetOrigin = isDev ? '*' : builderOrigin!;
      // Post asap after mount
      setTimeout(() => {
        window.parent?.postMessage({ type: 'PREVIEW_READY' }, targetOrigin);
        console.log('[Showcase] Sent PREVIEW_READY to parent');
      }, 0);
    } catch (e) {
      console.warn('[Showcase] Failed to notify parent about readiness', e);
    }

    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin
      const allowedOrigin = process.env.NEXT_PUBLIC_BUILDER_URL;
      
      // In development, allow any localhost port
      const isLocalhost = event.origin.startsWith('http://localhost:');
      const isDevelopment = !allowedOrigin || allowedOrigin.startsWith('http://localhost:');
      
      if (isDevelopment && !isLocalhost) {
        console.warn('[Showcase] Message from untrusted origin (dev mode):', event.origin);
        return;
      }
      
      // In production, only allow the specified builder URL
      if (!isDevelopment && event.origin !== allowedOrigin) {
        console.warn('[Showcase] Message from untrusted origin (prod mode):', event.origin);
        return;
      }

      if (event.data.type === 'THEME_UPDATE') {
        console.log('[Showcase] Received theme update:', event.data.colors);

        const colors = event.data.colors;
        
        // Apply CSS variables to document root
        Object.entries(colors).forEach(([key, value]) => {
          if (typeof value === 'string') {
            document.documentElement.style.setProperty(
              `--color-${key}`,
              value
            );
            console.log(`[Showcase] Applied CSS variable: --color-${key} = ${value}`);
          }
        });
      }

      if (event.data.type === 'SIDEBAR_UPDATE') {
        console.log('[Showcase] Received sidebar update:', event.data);
        const { elementId, colors } = event.data;
        applyElementColors(elementId, colors);
      }

      if (event.data.type === 'STRUCTURE_UPDATE') {
        try {
          const layout = event.data.layout;
          console.log('[Showcase] Received STRUCTURE_UPDATE', layout);
          rebuildLeftSidebar(layout);
        } catch (e) {
          console.warn('[Showcase] Failed to apply STRUCTURE_UPDATE', e);
        }
      }

      if (event.data.type === 'AUTH_UPDATE') {
        try {
          const payload = event.data.payload || {};
          if (payload.loginButton) {
            const btnWrapper = document.querySelector('[data-element-id="login-button"]') as HTMLElement | null;
            const target = (btnWrapper?.firstElementChild as HTMLElement) || (btnWrapper as HTMLElement) || null;
            if (target) {
              if (payload.loginButton.text) target.textContent = `${payload.loginButton.text}`;
              const styles = payload.loginButton.styles || {};
              Object.entries(styles).forEach(([k, v]) => {
                try { (target.style as any).setProperty(k, String(v), 'important'); } catch {}
              });
            }
          }
          if (payload.popup) {
            const input = document.querySelector('[data-element-id="auth-user-id-input"]') as HTMLInputElement | null;
            if (input && payload.popup.userIdPlaceholder) input.placeholder = payload.popup.userIdPlaceholder;
            const submit = document.querySelector('[data-element-id="auth-submit"]') as HTMLElement | null;
            if (submit && payload.popup.enterUserId) submit.textContent = payload.popup.enterUserId;
          }
          if (payload.popup && payload.popup.visible === true) {
            try {
              window.dispatchEvent(new Event('showAuthPopup'));
            } catch {}
          }
        } catch (e) {
          console.warn('[Showcase] Failed to apply AUTH_UPDATE', e);
        }
      }
    };

    const rebuildLeftSidebar = (layout: any) => {
      if (!layout) return;
      // Try to find left sidebar container by several strategies
      let sidebarWrapper = document.querySelector('[data-element-id="left-sidebar"]') as HTMLElement | null;
      if (!sidebarWrapper) {
        // any element-id containing 'sidebar'
        sidebarWrapper = document.querySelector('[data-element-id*="sidebar" i]') as HTMLElement | null;
      }
      if (!sidebarWrapper) {
        // try first aside as a fallback
        sidebarWrapper = document.querySelector('aside') as HTMLElement | null;
      }
      if (!sidebarWrapper) {
        console.warn('[Showcase] Left sidebar wrapper not found to rebuild');
        return;
      }
      const container = (sidebarWrapper.firstElementChild as HTMLElement) || (sidebarWrapper as HTMLElement);
      if (!container) return;
      // Clear existing dynamic items
      while (container.firstChild) container.removeChild(container.firstChild);

      const buildNode = (node: any): HTMLElement => {
        if (node.type === 'button') {
          const btn = document.createElement('button');
          btn.textContent = node?.props?.text || 'Button';
          btn.setAttribute('data-element-id', node.id || 'button');
          const s = node.styles || {};
          if (s.backgroundColor) btn.style.setProperty('background-color', s.backgroundColor, 'important');
          if (s.textColor) btn.style.setProperty('color', s.textColor, 'important');
          if (s.borderColor) btn.style.setProperty('border-color', s.borderColor, 'important');
          btn.className = 'px-3 py-2 rounded border';
          return btn;
        }
        // container or unknown: build a div and append children
        const div = document.createElement('div');
        if (node?.id) div.setAttribute('data-element-id', node.id);
        (node?.children || []).forEach((child: any) => div.appendChild(buildNode(child)));
        return div;
      };

      const rebuilt = buildNode(layout);
      // If the top node is the left-sidebar container itself, render its children
      if (rebuilt.children && rebuilt.children.length > 0) {
        Array.from(rebuilt.children).forEach((child) => container.appendChild(child.cloneNode(true)));
      } else {
        container.appendChild(rebuilt);
      }
    };

    const applyElementColors = (elementId: string, colors: Record<string, string>) => {
      const wrapperElement = document.querySelector(`[data-element-id="${elementId}"]`);

      if (!wrapperElement) {
        console.warn('[Showcase] Element not found:', elementId);
        return;
      }

      console.log('[Showcase] Applying colors to element:', { elementId, colors });

      // Try the first child, but if it's not an actionable element, search deeper
      const firstChild = wrapperElement.firstElementChild as HTMLElement | null;
      const candidateTargets: HTMLElement[] = [];

      if (firstChild) candidateTargets.push(firstChild);

      // Prefer actual interactive controls within
      const innerControl = wrapperElement.querySelector('button, a, [role="button"]') as HTMLElement | null;
      if (innerControl && innerControl !== firstChild) candidateTargets.push(innerControl);

      // Fallback to the wrapper itself if nothing else
      if (candidateTargets.length === 0 && wrapperElement instanceof HTMLElement) {
        candidateTargets.push(wrapperElement as HTMLElement);
      }

      const uniqueTargets = Array.from(new Set(candidateTargets));

      uniqueTargets.forEach((targetElement) => {
        console.log('[Showcase] Target element:', targetElement.tagName, targetElement.className);
        console.log('[Showcase] Before styles:', targetElement.style.backgroundColor, targetElement.style.color);

        const applyTo = [targetElement, ...Array.from(targetElement.querySelectorAll<HTMLElement>('*'))];

        Object.entries(colors).forEach(([rawKey, value]) => {
          const key = rawKey === 'background' ? 'backgroundColor' : rawKey; // alias support

          applyTo.forEach((el) => {
            if (key === 'backgroundColor') {
              // Ensure no gradient/image overrides the color
              el.style.setProperty('background-image', 'none', 'important');
              el.style.setProperty('background', value, 'important');
              el.style.setProperty('background-color', value, 'important');
            } else if (key === 'textColor' || key === 'color') {
              el.style.setProperty('color', value, 'important');
            } else if (key === 'borderColor') {
              el.style.setProperty('border-color', value, 'important');
            } else {
              // Fallback for other properties
              const cssKey = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
              el.style.setProperty(cssKey, value, 'important');
            }
          });
        });

        console.log('[Showcase] After styles:', targetElement.style.backgroundColor, targetElement.style.color);
      });

      console.log('[Showcase] Colors applied successfully with !important');
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [previewMode]);

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 md:p-8 overflow-x-hidden" 
      style={{ 
        background: 'var(--color-background, #0D1117)',
        color: 'var(--color-text, #FFFFFF)',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}
    >
      {previewMode && (
        <div className="mb-4 p-2 sm:p-3 bg-blue-900 text-blue-100 rounded-lg text-xs sm:text-sm">
          🔍 Preview Mode - This is a live preview from UI Builder
        </div>
      )}

      <div className="w-full max-w-full mx-auto space-y-8 sm:space-y-12" style={{ overflow: 'hidden' }}>
        {/* Offers Section */}
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--color-text, #FFFFFF)' }}>
            Special Offers
          </h2>
          <OffersList 
            showPopupOnFirstLoad={false}
          />
        </div>

        {/* Products Section */}
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--color-text, #FFFFFF)' }}>
            Products
          </h2>
          <ProductsList />
        </div>
      </div>

      {/* Mount AuthModule to enable popup rendering in preview */}
      <AuthModule renderPopupConfig={true} />
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading showcase...</p>
        </div>
      </div>
    }>
      <ShowcaseContent />
    </Suspense>
  );
}







