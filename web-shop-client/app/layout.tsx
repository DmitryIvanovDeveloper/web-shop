"use client";
import '../src/env'; // Load environment variables first
import 'reflect-metadata';
import { container } from '../src/infrastructure/bootstrap/container';
import "./output.css";
import { AuthModule } from '../src/modules/authentication/interface-adapters/ui/auth-module';
import { useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { APP_LAYOUT_TYPES } from '../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext } from '../src/shared/ui/action-context';
import type { PageConfig } from '../src/modules/app-layout/domain/value-objects/page-config.value-object';
import type { StyleConfig } from '../src/shared/ui/style-config';
import { LoadAppConfigUseCase } from '../src/application/use-cases/load-app-config.use-case';
import { LoadAppConfigFromMessageUseCase } from '../src/application/use-cases/load-app-config-from-message.use-case';
import { SubscribeToConfigUpdatesUseCase } from '../src/application/use-cases/subscribe-to-config-updates.use-case';
import { TYPES } from '../src/infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../src/shared/events/app-config-events';
import { IAsyncEventHandler } from '../src/infrastructure/events/events-handler.plugin';

const clampOpacity = (value: number): number => Math.min(1, Math.max(0, value));

const parseOpacityValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return clampOpacity(value);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return clampOpacity(parsed);
    }
  }
  return undefined;
};

const applyOpacityToColor = (color: string, opacity: number): string => {
  const clamped = clampOpacity(opacity);

  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${clamped})`;
    }
  }

  const rgbaMatch = color.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*[\d.]+\s*\)$/i);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }

  const rgbMatch = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }

  return color;
};

const resolveColorToken = (value: unknown, palette: Record<string, string>): string | undefined => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  return palette[value] ?? value;
};

const resolveRootStylesFromConfig = (config: PageConfig | null): { styles: CSSProperties; icon: string | null } => {
  if (!config) {
    return { styles: {}, icon: null };
  }

  const palette = (config.theme?.colors ?? {}) as unknown as Record<string, string>;
  const layoutStyles = (config.layout?.styles ?? {}) as Partial<StyleConfig>;
  const layoutProps = (config.layout?.props ?? {}) as Record<string, unknown>;

  const iconRaw = typeof layoutProps.icon === 'string' ? layoutProps.icon.trim() : '';
  const icon = iconRaw.length > 0 ? iconRaw : null;

  const styles: CSSProperties = {};

  const backgroundColor = resolveColorToken(layoutStyles.backgroundColor, palette);
  const backgroundOpacity = parseOpacityValue(layoutStyles.backgroundOpacity);
  if (backgroundColor) {
    styles.backgroundColor =
      backgroundOpacity !== undefined
        ? applyOpacityToColor(backgroundColor, backgroundOpacity)
        : backgroundColor;
  }

  if (layoutStyles.backgroundImage) {
    styles.backgroundImage = layoutStyles.backgroundImage;
  }
  if (layoutStyles.backgroundSize) {
    styles.backgroundSize = layoutStyles.backgroundSize as CSSProperties['backgroundSize'];
  }
  if (layoutStyles.backgroundPosition) {
    styles.backgroundPosition = layoutStyles.backgroundPosition as CSSProperties['backgroundPosition'];
  }
  if (layoutStyles.backgroundRepeat) {
    styles.backgroundRepeat = layoutStyles.backgroundRepeat as CSSProperties['backgroundRepeat'];
  }

  if (layoutStyles.border) {
    styles.border = layoutStyles.border as CSSProperties['border'];
  }
  const borderColor = resolveColorToken(layoutStyles.borderColor, palette);
  if (borderColor) {
    styles.borderColor = borderColor;
  }
  if (layoutStyles.borderWidth !== undefined) {
    styles.borderWidth = layoutStyles.borderWidth as CSSProperties['borderWidth'];
  }
  if (layoutStyles.borderStyle) {
    styles.borderStyle = layoutStyles.borderStyle as CSSProperties['borderStyle'];
  }
  if (layoutStyles.boxShadow) {
    styles.boxShadow = layoutStyles.boxShadow;
  }

  const rawLayoutStyles = layoutStyles as Record<string, unknown>;
  if (typeof rawLayoutStyles.backdropFilter === 'string') {
    styles.backdropFilter = rawLayoutStyles.backdropFilter as string;
  }
  if (layoutStyles.filter) {
    styles.filter = layoutStyles.filter;
  }

  return { styles, icon };
};

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
  const [rightSidebarRootStyles, setRightSidebarRootStyles] = useState<CSSProperties>({});
  const [sidebarMenuIcon, setSidebarMenuIcon] = useState<string | null>(null);
  useEffect(() => {
    const handleSidebarStylesUpdate = (): void => {
      try {
        const leftSidebar = resolveRootStylesFromConfig(sidebarPresenter.getSidebar());
        const rightSidebar = resolveRootStylesFromConfig(sidebarPresenter.getRightSidebar());

        setSidebarRootStyles(leftSidebar.styles);
        setRightSidebarRootStyles(rightSidebar.styles);
        setSidebarMenuIcon(leftSidebar.icon);
      } catch (error) {
        console.error('[RootLayout] Failed to resolve sidebar root styles:', error);
        setSidebarRootStyles({});
        setRightSidebarRootStyles({});
        setSidebarMenuIcon(null);
      }
    };

    const unsubscribe = sidebarPresenter.subscribe(handleSidebarStylesUpdate);
    handleSidebarStylesUpdate();

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

  const renderSidebarMenuIcon = (): ReactNode => {
    if (!sidebarMenuIcon) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    }

    if (sidebarMenuIcon.startsWith('data:image')) {
      return (
        <img
          src={sidebarMenuIcon}
          alt=""
          className="w-6 h-6 object-contain"
        />
      );
    }

    return (
      <span className="text-white text-xl leading-none" aria-hidden="true">
        {sidebarMenuIcon}
      </span>
    );
  };

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
                  className="p-2 hover:bg-[#34495e] rounded transition-colors bg-[#34495e] flex items-center justify-center" 
                  aria-label="Menu"
                  onClick={() => setIsLeftDrawerOpen(true)}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  {renderSidebarMenuIcon()}
                </button>
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
                <aside
                  data-element-id="right-sidebar"
                  className={isUIBuilderMode ? "block w-64 border-l border-yellow-400/30 flex-shrink-0" : "hidden xl:block w-64 border-l border-yellow-400/30 flex-shrink-0"}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)',
                    ...rightSidebarRootStyles
                  }}
                >
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
                <div className="fixed right-0 top-0 bottom-0 shadow-2xl animate-slide-in-right overflow-y-auto border-l border-yellow-400/30" style={(() => {
                  const {
                    backgroundColor,
                    backgroundImage,
                    backgroundSize,
                    backgroundPosition,
                    backgroundRepeat,
                    border: borderValue,
                    borderLeft,
                    borderColor,
                    borderWidth,
                    borderStyle,
                    boxShadow,
                    backdropFilter,
                    filter
                  } = rightSidebarRootStyles;

                  const style: CSSProperties = {
                    zIndex: 9999,
                    width: '85%',
                    backgroundColor: (backgroundColor as string | undefined) ?? '#1f2937',
                    borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)'
                  };

                  if (backgroundImage) style.backgroundImage = backgroundImage as string;
                  if (backgroundSize) style.backgroundSize = backgroundSize as CSSProperties['backgroundSize'];
                  if (backgroundPosition) style.backgroundPosition = backgroundPosition as CSSProperties['backgroundPosition'];
                  if (backgroundRepeat) style.backgroundRepeat = backgroundRepeat as CSSProperties['backgroundRepeat'];

                  if (borderValue) style.border = borderValue as CSSProperties['border'];
                  if (borderColor) style.borderColor = borderColor as CSSProperties['borderColor'];
                  if (borderWidth) style.borderWidth = borderWidth as CSSProperties['borderWidth'];
                  if (borderStyle) style.borderStyle = borderStyle as CSSProperties['borderStyle'];
                  if (boxShadow) style.boxShadow = boxShadow as CSSProperties['boxShadow'];

                  if (borderLeft) style.borderLeft = borderLeft as CSSProperties['borderLeft'];
                  if (backdropFilter) style.backdropFilter = backdropFilter as CSSProperties['backdropFilter'];
                  if (filter) style.filter = filter as CSSProperties['filter'];

                  return style;
                })()}>
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