"use client";
import '../src/env'; // Load environment variables first
import 'reflect-metadata';
import { container } from '../src/infrastructure/bootstrap/container';
import "./output.css";
import { AuthModule } from '../src/modules/authentication/interface-adapters/ui/auth-module';
import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { APP_LAYOUT_TYPES } from '../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext } from '../src/shared/ui/action-context';
import { LoadAppConfigUseCase } from '../src/application/use-cases/load-app-config.use-case';
import { LoadAppConfigFromMessageUseCase } from '../src/application/use-cases/load-app-config-from-message.use-case';
import { SubscribeToConfigUpdatesUseCase } from '../src/application/use-cases/subscribe-to-config-updates.use-case';
import { TYPES } from '../src/infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../src/shared/events/app-config-events';
import { IAsyncEventHandler } from '../src/infrastructure/events/events-handler.plugin';

export default function RootLayout({ children }: { children: React.ReactNode}) {
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  // Initialize isUIBuilderMode to false to match SSR, then update in useEffect
  const [isUIBuilderMode, setIsUIBuilderMode] = useState(false);
  
  // Viewport mode from UI Builder (mobile/tablet/desktop)
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop' | null>(null);

  // Initialize isUIBuilderMode on client side to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const isUIBuilder = url.searchParams.get('uibuilder') === 'true';
        setIsUIBuilderMode(isUIBuilder);
      } catch (err) {
        console.error('[RootLayout] Failed to parse URL for uibuilder param:', err);
      }
    }
  }, []);

  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

  const [sidebarRootStyles, setSidebarRootStyles] = useState<CSSProperties>({});
  useEffect(() => {
    const resolveSidebarRootStyles = (): void => {
      try {
        const sidebarConfig = sidebarPresenter.getSidebar();
        const styles = (sidebarConfig?.layout?.styles ?? {}) as Record<string, unknown>;
        const colors = (sidebarConfig?.theme?.colors ?? {}) as Record<string, string>;

        if (!styles || Object.keys(styles).length === 0) {
          setSidebarRootStyles({});
          return;
        }

        const resolveColor = (value: unknown): string | undefined => {
          if (typeof value !== 'string') return undefined;
          return colors[value] ?? value;
        };

        const nextStyles: CSSProperties = {};
        const backgroundColor = resolveColor(styles.backgroundColor);
        if (backgroundColor) {
          nextStyles.backgroundColor = backgroundColor;
        }
        if (typeof styles.backgroundImage === 'string') {
          nextStyles.backgroundImage = styles.backgroundImage;
        }
        if (typeof styles.backgroundSize === 'string') {
          nextStyles.backgroundSize = styles.backgroundSize as string;
        }
        if (typeof styles.backgroundPosition === 'string') {
          nextStyles.backgroundPosition = styles.backgroundPosition as string;
        }
        if (typeof styles.backgroundRepeat === 'string') {
          nextStyles.backgroundRepeat = styles.backgroundRepeat as string;
        }

        setSidebarRootStyles(nextStyles);
      } catch (error) {
        console.error('[RootLayout] Failed to resolve sidebar root styles:', error);
        setSidebarRootStyles({});
      }
    };

    const unsubscribe = sidebarPresenter.subscribe(resolveSidebarRootStyles);
    resolveSidebarRootStyles();

    return () => {
      unsubscribe();
    };
  }, [sidebarPresenter]);

  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
  };

  // Load app-config при старте приложения и подписка на real-time обновления
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        setIsConfigLoading(true);
        
        const loadAppConfigUseCase = container.get<LoadAppConfigUseCase>(TYPES.LoadAppConfig);
        const shouldLoadDraft = resolveShouldLoadDraft();
        await loadAppConfigUseCase.execute(shouldLoadDraft);
        console.log('[RootLayout] App config loaded and distributed via EventBus');
        
        // 2. Subscribe to real-time config updates (only if not in UI Builder preview mode)
        const isUIBuilderPreview = getIsUIBuilderFromQuery();
        if (!isUIBuilderPreview) {
          const appId = getAppIdFromEnvironment();
          if (appId) {
            const subscribeToUpdatesUseCase = container.get<SubscribeToConfigUpdatesUseCase>(TYPES.SubscribeToConfigUpdates);
            await subscribeToUpdatesUseCase.execute(appId);
            console.log('[RootLayout] Subscribed to real-time config updates');
          }
        } else {
          console.log('[RootLayout] Skipping Realtime subscription - in UI Builder preview mode');
        }
        
        // Ожидаем событие применения конфига, как только модули его обработают
        const safety = setTimeout(() => setIsConfigLoading(false), 2000);
        const onAppConfigLoaded = () => {
          clearTimeout(safety);
          setIsConfigLoading(false);
        };
        window.addEventListener('appConfigLoaded', onAppConfigLoaded, { once: true });
      } catch (err) {
        console.error('[RootLayout] Failed to initialize config:', err);
        setIsConfigLoading(false);
      }
    };

    const getIsUIBuilderFromQuery = (): boolean => {
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          return url.searchParams.get('uibuilder') === 'true';
        } catch {}
      }
      return false;
    };

    const getAppIdFromEnvironment = (): string | null => {
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          const fromQuery = url.searchParams.get('appId');
          if (fromQuery) return fromQuery;
        } catch {}
      }
      return process.env.NEXT_PUBLIC_APP_ID || null;
    };

    const resolveShouldLoadDraft = (): boolean => {
      if (typeof window === 'undefined') {
        return false;
      }

      try {
        const url = new URL(window.location.href);
        const draftParams = ['previewMode', 'pagePreview', 'uibuilder'];
        return draftParams.some((param) => url.searchParams.get(param) === 'true');
      } catch {
        return false;
      }
    };

    initializeConfig();

    // Cleanup subscription on unmount
    return () => {
      try {
        const subscribeUseCase = container.get<SubscribeToConfigUpdatesUseCase>(TYPES.SubscribeToConfigUpdates);
        subscribeUseCase.cleanup();
        console.log('[RootLayout] Unsubscribed from config updates');
      } catch (err) {
        console.error('[RootLayout] Failed to unsubscribe from config updates:', err);
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (isUIBuilderMode) {
        // In UI Builder preview: use viewportMode from parent if available, otherwise use window width
        if (viewportMode) {
          // For tablet (1024px), match real app behavior: isMobile = true (sidebars hidden)
          // For mobile: isMobile = true (sidebars hidden)
          // For desktop: isMobile = false (sidebars visible)
          setIsMobile(viewportMode === 'mobile' || viewportMode === 'tablet');
        } else {
          // Fallback: use window width (iframe width)
          setIsMobile(window.innerWidth <= 1024);
        }
      } else {
        // Normal mode: use window width
        setIsMobile(window.innerWidth <= 1024);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isUIBuilderMode, viewportMode]);

  // Listen for config updates from UI Builder via postMessage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleConfigUpdate = async (event: MessageEvent) => {
      // Verify origin - allow localhost in development
      const isLocalhost = event.origin.startsWith('http://localhost:');
      const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL;
      const isDevelopment = !builderOrigin || builderOrigin.startsWith('http://localhost:');
      
      if (!isDevelopment && event.origin !== builderOrigin) {
        console.warn('[RootLayout] Message from untrusted origin:', event.origin);
        return;
      }

      if (isDevelopment && !isLocalhost) {
        console.warn('[RootLayout] Message from non-localhost origin in dev mode:', event.origin);
        return;
      }

      // Handle CONFIG_UPDATE message
      // Note: CONFIG_UPDATE is also handled in PageRenderer for offerCards and selectedOfferCardId
      // This handler only processes the app-config part for AppConfigLoadedEvent
      if (event.data.type === 'CONFIG_UPDATE') {
        const config = event.data.payload?.config;
        if (!config) {
          console.warn('[RootLayout] Received CONFIG_UPDATE without config payload');
          return;
        }

        console.log('[RootLayout] Received CONFIG_UPDATE from UI Builder');
        
        try {
          // Use LoadAppConfigFromMessageUseCase to publish AppConfigLoadedEvent
          // This is needed for other modules that listen to AppConfigLoadedEvent
          const loadConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(TYPES.LoadAppConfigFromMessage);
          await loadConfigFromMessageUseCase.execute(config);
          
          console.log('[RootLayout] Config processed from postMessage');
        } catch (error) {
          console.error('[RootLayout] Failed to process CONFIG_UPDATE:', error);
        }
      }

      // Handle VIEWPORT_MODE_UPDATE message from UI Builder
      if (event.data.type === 'VIEWPORT_MODE_UPDATE') {
        const mode = event.data.payload?.viewportMode;
        if (mode && (mode === 'mobile' || mode === 'tablet' || mode === 'desktop')) {
          console.log('[RootLayout] Received VIEWPORT_MODE_UPDATE:', mode);
          setViewportMode(mode);
        }
      }
    };

    window.addEventListener('message', handleConfigUpdate);
    console.log('[RootLayout] Listening for CONFIG_UPDATE messages from UI Builder');

    return () => {
      window.removeEventListener('message', handleConfigUpdate);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Web Shop</title>
        <meta name="description" content="Web Shop Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </head>
      <body className="m-0 p-0 overflow-hidden">
        <>
            {/* Global Loader - показывается пока загружается app-config.json */}
            {isConfigLoading && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#0D1117',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            {/* Spinner */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                border: '4px solid rgba(251, 191, 36, 0.2)',
                borderTop: '4px solid #FBBF24',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            {/* Loading Text */}
            <p 
              style={{
                marginTop: '24px',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Loading...
            </p>
          </div>
          )}

            {/* AuthModule - управляет авторизацией и рендерит popup */}
            <AuthModule renderSidebarButton={false} renderPopupConfig={true} />

            {/* Mobile Header - показывается только на мобилке */}
            {isMobile && (
              <header
                className="px-4 flex items-center justify-between relative"
                style={(() => {
                  const {
                    backgroundColor,
                    backgroundImage,
                    backgroundSize,
                    backgroundPosition,
                    backgroundRepeat
                  } = sidebarRootStyles;

                  const style: CSSProperties = {
                    height: '56px',
                    minHeight: '56px',
                    zIndex: 100,
                    backgroundColor: backgroundColor ?? '#2c3e50'
                  };

                  if (backgroundImage) style.backgroundImage = backgroundImage;
                  if (backgroundSize) style.backgroundSize = backgroundSize;
                  if (backgroundPosition) style.backgroundPosition = backgroundPosition;
                  if (backgroundRepeat) style.backgroundRepeat = backgroundRepeat;

                  return style;
                })()}
              >
                <button 
                  className="p-2 hover:bg-[#34495e] rounded transition-colors bg-[#34495e]" 
                  aria-label="Menu"
                  onClick={() => setIsLeftDrawerOpen(true)}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <span className="text-white font-semibold text-lg">Web Shop</span>
                <button 
                  className="p-2 hover:bg-[#34495e] rounded transition-colors bg-[#34495e]" 
                  aria-label="Profile"
                  onClick={() => setIsRightDrawerOpen(true)}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </header>
            )}
        
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex relative h-screen md:h-screen" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
              {/* Left Sidebar - скрывается на экранах < 1280px (xl breakpoint), но всегда показывается в UI Builder */}
              {!isMobile && (
                <aside
                  data-element-id="left-sidebar"
                  className={isUIBuilderMode ? "block w-64 border-r border-gray-700 flex-shrink-0" : "hidden xl:block w-64 border-r border-gray-700 flex-shrink-0"}
                  style={{
                    borderLeft: '2px solid rgba(251, 191, 36, 0.3)',
                    ...sidebarRootStyles
                  }}
                >
                  <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} />
                </aside>
              )}

              {/* Main Content - занимает всю ширину на < xl, иначе между sidebar'ами */}
              <main className="flex-1 overflow-y-auto w-full">
                {children}
              </main>

              {/* Right Sidebar - скрывается на экранах < 1280px (xl breakpoint), но всегда показывается в UI Builder */}
              {!isMobile && (
                <aside className={isUIBuilderMode ? "block w-64 border-l border-yellow-400/30 flex-shrink-0" : "hidden xl:block w-64 border-l border-yellow-400/30 flex-shrink-0"} style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(2px)', borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)' }}>
                  <div className="p-4">
                    <div className="mb-4">
                      <AuthModule renderSidebarButton={true} renderPopupConfig={true} />
                    </div>
                  
                    <SidebarRenderer 
                      presenter={sidebarPresenter} 
                      layoutType="rightSidebar"
                      actionContext={actionContext}
                    />
                  </div>
                </aside>
              )}
            </div>

            {/* Left Drawer Overlay */}
            {isLeftDrawerOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50"
                  style={{ zIndex: 9998 }}
                  onClick={() => setIsLeftDrawerOpen(false)}
                />
                <div
                  className="fixed left-0 top-0 bottom-0 shadow-2xl animate-slide-in-left overflow-y-auto w-full"
                  style={(() => {
                    const {
                      backgroundColor,
                      backgroundImage,
                      backgroundSize,
                      backgroundPosition,
                      backgroundRepeat
                    } = sidebarRootStyles;

                    const style: CSSProperties = {
                      zIndex: 9999,
                      width: '85%',
                      backgroundColor: backgroundColor ?? '#1f2937'
                    };

                    if (backgroundImage) style.backgroundImage = backgroundImage;
                    if (backgroundSize) style.backgroundSize = backgroundSize;
                    if (backgroundPosition) style.backgroundPosition = backgroundPosition;
                    if (backgroundRepeat) style.backgroundRepeat = backgroundRepeat;

                    return style;
                  })()}
                >
                  <div className="w-full h-full">
                    <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} />
                  </div>
                </div>
              </>
            )}

            {/* Right Drawer Overlay */}
            {isRightDrawerOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50"
                  style={{ zIndex: 9998 }}
                  onClick={() => setIsRightDrawerOpen(false)}
                />
                <div className="fixed right-0 top-0 bottom-0 shadow-2xl animate-slide-in-right overflow-y-auto border-l border-yellow-400/30" style={{ zIndex: 9999, backgroundColor: '#1f2937', borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)', width: '85%' }}>
                  <div className="p-4">
                    <div className="mb-4">
                      <AuthModule renderSidebarButton={true} renderPopupConfig={true} />
                    </div>
                
                    <SidebarRenderer 
                      presenter={sidebarPresenter} 
                      layoutType="rightSidebar"
                      actionContext={actionContext}
                    />
                  </div>
                </div>
              </>
            )}
          </>
      </body>
    </html>
  );
}