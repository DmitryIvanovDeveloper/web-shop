"use client";
import '../src/env'; import 'reflect-metadata';
import { container } from '../src/infrastructure/bootstrap/container';
import "./output.css";
import { AuthModule } from '../src/modules/authentication/interface-adapters/ui/auth-module';
import { PersonalOffersWidget } from '../src/modules/personal-offers/interface-adapters/ui/components/personal-offers-widget';
import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { APP_LAYOUT_TYPES } from '../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext, SelectOption } from '../src/shared/ui/action-context';
import type { PageConfig } from '../src/modules/app-layout/domain/value-objects/page-config.value-object';
import type { StyleConfig } from '../src/shared/ui/style-config';
import { LoadAppConfigUseCase } from '../src/application/use-cases/load-app-config.use-case';
import { LoadAppConfigFromMessageUseCase } from '../src/application/use-cases/load-app-config-from-message.use-case';
import { SubscribeToConfigUpdatesUseCase } from '../src/application/use-cases/subscribe-to-config-updates.use-case';
import { TYPES } from '../src/infrastructure/bootstrap/types';
import { LOCALIZATION_TYPES } from '../src/modules/localization/infrastructure/bootstrap/types';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isUIBuilderMode, setIsUIBuilderMode] = useState(false);

  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop' | null>(null);

  const [availableLanguages, setAvailableLanguages] = useState<SelectOption[]>([]);

  const [isNavigating, setIsNavigating] = useState(false);

  const getAppTranslations = () => {
    try {
      const presenter = container.get(LOCALIZATION_TYPES.LocalizationPresenter) as any;
      const vm = presenter.viewModel;
      return {
        loading: vm.translations['app.loading'] || 'Loading...',
        title: vm.translations['app.title'] || 'Web Shop'
      };
    } catch {
      return {
        loading: 'Loading...',
        title: 'Web Shop'
      };
    }
  };
  const appTranslations = getAppTranslations();

  const applyElementSelectionMode = useCallback((enabled: boolean) => {
    if (typeof window !== 'undefined') {
      (window as any).__elementSelectionMode = enabled;
      window.dispatchEvent(new CustomEvent('elementSelectionModeChanged', { detail: { enabled } }));
    }

    if (typeof document !== 'undefined') {
      if (enabled) {
        document.body.setAttribute('data-selection-mode', 'true');
      } else {
        document.body.removeAttribute('data-selection-mode');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const isUIBuilder = url.searchParams.get('uibuilder') === 'true';
        setIsUIBuilderMode(isUIBuilder);
      } catch (err) {
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

  useEffect(() => {
    const applyThemeBackground = (): void => {
      try {
        const sidebar = sidebarPresenter.getSidebar();
        if (!sidebar) return;

        const palette = (sidebar.theme?.colors ?? {}) as unknown as Record<string, string>;
        const layoutStyles = (sidebar.layout?.styles ?? {}) as Partial<StyleConfig>;

        const backgroundColor = resolveColorToken(layoutStyles.backgroundColor, palette);
        const backgroundOpacity = parseOpacityValue(layoutStyles.backgroundOpacity);

        if (backgroundColor && typeof document !== 'undefined' && document.body) {
          const finalColor = backgroundOpacity !== undefined
            ? applyOpacityToColor(backgroundColor, backgroundOpacity)
            : backgroundColor;

          document.body.style.setProperty('background-color', finalColor, 'important');
        }
      } catch (error) {
      }
    };

    setTimeout(() => {
      applyThemeBackground();
    }, 0);

    const handleAppConfigLoaded = (): void => {
      setTimeout(() => {
        applyThemeBackground();
      }, 0);
    };

    window.addEventListener('appConfigLoaded', handleAppConfigLoaded);

    const unsubscribe = sidebarPresenter.subscribe(() => {
      applyThemeBackground();
    });

    return () => {
      window.removeEventListener('appConfigLoaded', handleAppConfigLoaded);
      unsubscribe();
    };
  }, [sidebarPresenter]);

  const navigateWithQuery = (path: string) => {
    const url = new URL(window.location.href);
    const currentParams = new URLSearchParams(searchParams.toString());

    const appId = currentParams.get('appId') || currentParams.get('app') || url.searchParams.get('appId') || url.searchParams.get('app');
    if (appId) {
      currentParams.set('appId', appId);
    }

    const userId = currentParams.get('userId') || url.searchParams.get('userId');
    if (userId) {
      currentParams.set('userId', userId);
    }

    const queryString = currentParams.toString();
    const newUrl = queryString ? `${path}?${queryString}` : path;
    setIsNavigating(true);
    router.push(newUrl);
  };

  useEffect(() => {
    setIsNavigating(false);
  }, [searchParams]);

  const actionContext: ActionContext = {
    onPopupOpen: () => { },
    onPopupClose: () => { },
    navigate: (url: string) => {
      if (typeof url === 'string') {
        navigateWithQuery(url);
      }
    },
    navigateToHome: () => {
      setIsNavigating(true);
      navigateWithQuery('/');
    },
    navigateToPatchNotes: () => {
      setIsNavigating(true);
      navigateWithQuery('/patch-notes');
    },
    navigateToStore: () => {
      setIsNavigating(true);
      navigateWithQuery('/store');
    },
    navigateToDailyRewards: () => {
      setIsNavigating(true);
      navigateWithQuery('/daily-rewards');
    },
    availableLanguages,
    changeLanguage: async (languageCode: string) => {
      try {
        if (!languageCode || typeof languageCode !== 'string' || !/^[a-z]{2,3}$/.test(languageCode)) {
          return;
        }

        const localizationPresenter = container.get(LOCALIZATION_TYPES.LocalizationPresenter) as any;

        await localizationPresenter.changeLanguage(languageCode);

      } catch (error) {
      }
    },
  };

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        setIsConfigLoading(true);

        const loadAppConfigUseCase = container.get<LoadAppConfigUseCase>(TYPES.LoadAppConfig);
        const shouldLoadDraft = resolveShouldLoadDraft();
        const appId = getAppIdFromEnvironment();
        await loadAppConfigUseCase.execute(shouldLoadDraft, appId || undefined);
        const localizationPresenter = container.get(LOCALIZATION_TYPES.LocalizationPresenter) as any;
        await localizationPresenter.loadLocalization();
        const isUIBuilderPreview = getIsUIBuilderFromQuery();
        if (!isUIBuilderPreview) {
          const appId = getAppIdFromEnvironment();
          if (appId) {
            const subscribeToUpdatesUseCase = container.get<SubscribeToConfigUpdatesUseCase>(TYPES.SubscribeToConfigUpdates);
            await subscribeToUpdatesUseCase.execute(appId);
          }
        } else {
        }

        const safety = setTimeout(() => setIsConfigLoading(false), 2000);
        const onAppConfigLoaded = () => {
          clearTimeout(safety);
          setIsConfigLoading(false);
        };
        window.addEventListener('appConfigLoaded', onAppConfigLoaded, { once: true });
      } catch (err) {
        setIsConfigLoading(false);
      }
    };

    const getIsUIBuilderFromQuery = (): boolean => {
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          return url.searchParams.get('uibuilder') === 'true';
        } catch { }
      }
      return false;
    };

    const getAppIdFromEnvironment = (): string | null => {
      if (typeof window === 'undefined') {
        return null;
      }

      try {
        const url = new URL(window.location.href);
        const fromQuery = url.searchParams.get('appId') || url.searchParams.get('app');
        return fromQuery || null;
      } catch {
        return null;
      }
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

    return () => {
      try {
        const subscribeUseCase = container.get<SubscribeToConfigUpdatesUseCase>(TYPES.SubscribeToConfigUpdates);
        subscribeUseCase.cleanup();
      } catch (err) {
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (isUIBuilderMode) {
        if (viewportMode) {
          setIsMobile(viewportMode === 'mobile' || viewportMode === 'tablet');
        } else {
          setIsMobile(window.innerWidth <= 1024);
        }
      } else {
        setIsMobile(window.innerWidth <= 1024);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isUIBuilderMode, viewportMode]);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch('/api/localization/languages');
        if (response.ok) {
          const languages = await response.json();
          const options: SelectOption[] = languages.map((lang: any) => ({
            value: lang.code,
            label: `${lang.name} (${lang.nativeName})`
          }));
          setAvailableLanguages(options);
        } else {
        }
      } catch (error) {
      }
    };

    loadLanguages();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleConfigUpdate = async (event: MessageEvent) => {
      const isLocalhost = event.origin.startsWith('http://localhost');
      if (!isLocalhost) {
        return;
      }

      if (event.data.type === 'CONFIG_UPDATE') {
        const config = event.data.payload?.config;
        if (!config) {
          return;
        }

        try {
          const loadConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(TYPES.LoadAppConfigFromMessage);
          await loadConfigFromMessageUseCase.execute(config);
          const selectionModeValue =
            typeof (config as { elementSelectionMode?: unknown }).elementSelectionMode === 'boolean'
              ? (config as { elementSelectionMode?: boolean }).elementSelectionMode
              : Boolean((config as { elementSelectionMode?: unknown }).elementSelectionMode);
          applyElementSelectionMode(selectionModeValue ?? false);
        } catch (error) {
          // ignore config errors from builder messages
        }
      }

      if (event.data.type === 'VIEWPORT_MODE_UPDATE') {
        const mode = event.data.payload?.viewportMode;
        if (mode && (mode === 'mobile' || mode === 'tablet' || mode === 'desktop')) {
          setViewportMode(mode);
        }
      }
    };

    window.addEventListener('message', handleConfigUpdate);
    return () => {
      window.removeEventListener('message', handleConfigUpdate);
    };
  }, [applyElementSelectionMode]);

  const renderSidebarMenuIcon = (): ReactNode => {
    if (!sidebarMenuIcon) {
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
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
        <title>{appTranslations.title}</title>
        <meta name="description" content="Web Shop Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes loading-bar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </head>
      <body className="m-0 p-0 overflow-hidden">
        <>
          { }
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
              { }
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
              { }
              <p
                style={{
                  marginTop: '24px',
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {appTranslations.loading}
              </p>
            </div>
          )}

          { }
          <AuthModule renderSidebarButton={false} renderPopupConfig={true} />

          { }
          <PersonalOffersWidget />

          { }
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </header>
          )}

          { }
          {isNavigating && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: '#3B82F6',
                zIndex: 1000,
                animation: 'loading-bar 0.3s ease-out'
              }}
            />
          )}

          <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex relative h-screen md:h-screen" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
            { }
            {!isMobile && (
              <aside
                data-element-id="left-sidebar"
                className={(() => {
                  const baseClasses = isUIBuilderMode ? "block w-64 border-r border-gray-700 flex-shrink-0" : "hidden xl:block w-64 border-r border-gray-700 flex-shrink-0";

                  const hasSupabaseStyles = Object.keys(sidebarRootStyles).length > 0;
                  if (!hasSupabaseStyles) {
                    return `${baseClasses} flex min-h-full min-w-15 flex-col gap-4 px-6 py-3`;
                  }

                  return baseClasses;
                })()}
                style={(() => {
                  const { borderLeft, borderColor, borderWidth, borderStyle, ...otherStyles } = sidebarRootStyles;
                  const style: CSSProperties = { ...otherStyles };

                  if (borderLeft) {
                    style.borderLeft = borderLeft as CSSProperties['borderLeft'];
                  } else {
                    if (borderColor) style.borderColor = borderColor as CSSProperties['borderColor'];
                    if (borderWidth) style.borderWidth = borderWidth as CSSProperties['borderWidth'];
                    if (borderStyle) style.borderStyle = borderStyle as CSSProperties['borderStyle'];
                    if (!borderColor && !borderWidth && !borderStyle) {
                      style.borderLeft = '2px solid rgba(251, 191, 36, 0.3)';
                    }
                  }

                  return style;
                })()}
              >
                <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} currentPathname={pathname} />
              </aside>
            )}

            { }
            <main className="flex-1 overflow-y-auto w-full px-4 md:px-8">
              {children}
            </main>

            { }
            {!isMobile && (
              <aside
                data-element-id="right-sidebar"
                className={isUIBuilderMode ? "block w-64 border-l border-yellow-400/30 flex-shrink-0" : "hidden xl:block w-64 border-l border-yellow-400/30 flex-shrink-0"}
                style={(() => {
                  const { borderLeft, borderColor, borderWidth, borderStyle, ...otherStyles } = rightSidebarRootStyles;
                  const style: CSSProperties = {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    ...otherStyles
                  };

                  if (borderLeft) {
                    style.borderLeft = borderLeft as CSSProperties['borderLeft'];
                  } else {
                    if (borderColor) style.borderColor = borderColor as CSSProperties['borderColor'];
                    if (borderWidth) style.borderWidth = borderWidth as CSSProperties['borderWidth'];
                    if (borderStyle) style.borderStyle = borderStyle as CSSProperties['borderStyle'];
                    if (!borderColor && !borderWidth && !borderStyle) {
                      style.borderLeft = '0.5px solid rgba(156, 163, 175, 0.5)';
                    }
                  }

                  return style;
                })()}
              >
                <div className="p-4">
                  <div className="mb-4">
                    <AuthModule renderSidebarButton={true} renderPopupConfig={true} />
                  </div>

                  <SidebarRenderer
                    presenter={sidebarPresenter}
                    layoutType="rightSidebar"
                    currentPathname={pathname}
                    actionContext={actionContext}
                  />
                </div>
              </aside>
            )}
          </div>

          { }
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
                  <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} currentPathname={pathname} />
                </div>
              </div>
            </>
          )}

          { }
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
                  backgroundColor: (backgroundColor as string | undefined) ?? '#1f2937'
                };

                if (backgroundImage) style.backgroundImage = backgroundImage as string;
                if (backgroundSize) style.backgroundSize = backgroundSize as CSSProperties['backgroundSize'];
                if (backgroundPosition) style.backgroundPosition = backgroundPosition as CSSProperties['backgroundPosition'];
                if (backgroundRepeat) style.backgroundRepeat = backgroundRepeat as CSSProperties['backgroundRepeat'];

                if (borderValue) style.border = borderValue as CSSProperties['border'];

                if (borderLeft) {
                  style.borderLeft = borderLeft as CSSProperties['borderLeft'];
                } else {
                  if (borderColor) style.borderColor = borderColor as CSSProperties['borderColor'];
                  if (borderWidth) style.borderWidth = borderWidth as CSSProperties['borderWidth'];
                  if (borderStyle) style.borderStyle = borderStyle as CSSProperties['borderStyle'];
                  if (!borderColor && !borderWidth && !borderStyle) {
                    style.borderLeft = '0.5px solid rgba(156, 163, 175, 0.5)';
                  }
                }

                if (boxShadow) style.boxShadow = boxShadow as CSSProperties['boxShadow'];
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
                    currentPathname={pathname}
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