import { injectable } from 'inversify';
import type { UIRendererModuleConfig } from '../../../../shared/config/app-config.types';
import { PageConfig } from '../../domain/value-objects/page-config.value-object';
import { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';
import { ComponentNode } from '../../domain/value-objects/component-node.value-object';
import { Result } from '../../../../shared/result/result';
import { AppLayoutError } from '../../domain/errors/ui-renderer.error';

@injectable()
export class SidebarRendererPresenter {
  private _configs: UIRendererModuleConfig | null = null;
  private _listeners: Array<() => void> = [];
  private _translations: Record<string, string> = {};
  private _languageCode: string = 'en';
  private _direction: 'ltr' | 'rtl' = 'ltr';
  private _currentPathname: string = '/';

  public readonly labels = {
    loading: 'Loading...',
    error: 'Failed to load configuration',
    notReady: 'Configuration not loaded yet',
    store: 'Store',
  } as const;

  
  public setCurrentPathname(pathname: string): void {
        if (this._currentPathname === pathname) {
            return;
    }
    this._currentPathname = pathname;
            this._listeners.forEach(listener => listener());
  }

  
  private _isButtonActive(buttonType: 'home' | 'store' | 'patch-notes' | 'daily-rewards' | 'loyalty-program' | 'news' | 'updates' | 'events'): boolean {
    const isActive = (() => {
      switch (buttonType) {
        case 'home':
          return this._currentPathname === '/';
        case 'store':
          return this._currentPathname === '/store';
        case 'patch-notes':
          return this._currentPathname === '/patch-notes';
        case 'daily-rewards':
          return this._currentPathname === '/daily-rewards';
        case 'loyalty-program':
          return this._currentPathname === '/loyalty-program';
        case 'news':
          return this._currentPathname === '/news';
        case 'updates':
          return this._currentPathname === '/updates';
        case 'events':
          return this._currentPathname === '/events';
        default:
          return false;
      }
    })();
    console.log(`[SidebarRendererPresenter] _isButtonActive(${buttonType}): currentPath=${this._currentPathname}, isActive=${isActive}`);
    return isActive;
  }

  
  private _getButtonTypeFromId(buttonId: string): 'home' | 'store' | 'patch-notes' | 'daily-rewards' | 'loyalty-program' | 'news' | 'updates' | 'events' | null {
    switch (buttonId) {
      case 'home-button':
        return 'home';
      case 'store-button':
        return 'store';
      case 'patch-notes-button':
        return 'patch-notes';
      case 'daily-rewards-button':
        return 'daily-rewards';
      case 'loyalty-program-button':
        return 'loyalty-program';
      case 'news-button':
        return 'news';
      case 'updates-button':
        return 'updates';
      case 'events-button':
        return 'events';
      default:
        return null;
    }
  }

  
  public setConfigs(configs: UIRendererModuleConfig): void {
    console.log('[SidebarRendererPresenter] setConfigs called with configs:', !!configs, 'sidebar exists:', !!(configs as any)?.sidebar);
    this._configs = configs;
            this._listeners.forEach(listener => listener());
  }

  
  public subscribe(listener: () => void): () => void {
        this._listeners.push(listener);

        if (this._configs !== null) {
            listener();
    }

        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  
  public getSidebar(): PageConfig | null {
    console.log(
      '[SidebarRendererPresenter] getSidebar called, currentPathname:',
      this._currentPathname,
      '_configs exists:',
      !!this._configs,
      '_configs.sidebar exists:',
      !!(this._configs?.sidebar),
    );

    const sidebarConfig = this._configs?.sidebar;

    // Если конфиг для sidebar отсутствует -- используем жёсткий дефолт
    if (!sidebarConfig) {
      return this._getDefaultSidebarConfig();
    }

    // Если конфиг есть — рендерим его целиком, но гарантируем,
    // что селектор локализации присутствует внизу сайдбара.
    const enhancedConfig = this._ensureLanguageSelectorInSidebarConfig(sidebarConfig);
    return this._convertToPageConfig(enhancedConfig, 'sidebar');
  }

  
  // NOTE: _mergeSidebarConfigs is kept for backwards compatibility but no longer used in getSidebar.
  // External configs coming from app_configs should fully control the sidebar layout and styles
  // whenever they are present.

  
  private _getDefaultSidebarConfig(): PageConfig | null {
    try {
                  const defaultSidebarLayout = {
        version: "1.0",
        theme: {
          colors: {
            primary: "#3B5AFE",
            background: "#0D1117",
            surface: "#161B22",
            text: "#FFFFFF"
          },
          spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80]
        },
        layout: {
          id: "sidebar-container",
          type: "Container",
          props: {
            vertical: true,
            sidebar: true
          },
          styles: {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "16px",
            backgroundColor: "surface",
            minHeight: "100vh",
            width: "100%",
                        className: "flex flex-col gap-3 px-4 py-4"
          },
          children: [
            {
              id: "home-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.home", "Home"),
                icon: "🏠",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",                 hoverOpacity: 0.95,                 hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",                 borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",                                 className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToHome"
                }
              }
            },
            {
              id: "store-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.store", "Store"),
                icon: "🛒",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",                 hoverOpacity: 0.95,                 hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",                 borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",                                 className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50 bg-sem-component-sf-component-menu-store hover:bg-sem-component-sf-component-menu-store-hover data-[active=true]:bg-sem-component-sf-component-menu-store-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToStore"
                }
              }
            },
            {
              id: "patch-notes-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.patchNotes", "Patch Notes"),
                icon: "📋",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",                 hoverOpacity: 0.95,                 hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",                 borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",                                 className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToPatchNotes"
                }
              }
            },
            {
              id: "daily-rewards-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.dailyRewards", "Daily Rewards"),
                icon: "🎁",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",
                hoverOpacity: 0.95,
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToDailyRewards"
                }
              }
            },
            {
              id: "loyalty-program-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.loyaltyProgram", "Loyalty Program"),
                icon: "⭐",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",
                hoverOpacity: 0.95,
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToLoyaltyProgram"
                }
              }
            },
            {
              id: "news-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.news", "News"),
                icon: "📰",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",
                hoverOpacity: 0.95,
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToNews"
                }
              }
            },
            {
              id: "updates-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.updates", "Updates"),
                icon: "🔄",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",
                hoverOpacity: 0.95,
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToUpdates"
                }
              }
            },
            {
              id: "events-button",
              type: "Button",
              props: {
                text: this.getTranslation("nav.events", "Events"),
                icon: "🎉",
                fullWidth: true
              },
              styles: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0",
                hoverOpacity: 0.95,
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)",
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out",
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToEvents"
                }
              }
            },
            {
              id: "language-selector",
              type: "Select",
              props: {
                options: [
                  { value: "en", label: "English (English)" },
                  { value: "ar", label: "Arabic (العربية)" }
                ],
                placeholder: "🌐 Language",
                                value: this._languageCode
              },
              styles: {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                marginTop: "auto",                 backgroundColor: "surface",
                textColor: "#FFFFFF",
                borderRadius: "8px",
                marginBottom: "4px",
                                className: "group/select-trigger flex min-h-9 w-full min-w-48 cursor-pointer items-center justify-between rounded-input border border-sem-border-br-base-secondary-invert bg-sem-surface-sf-base-secondary px-3 py-2 text-left font-medium text-caption-lg text-sem-text-tx-quaternary shadow-sm transition-colors hover:cursor-pointer hover:border-sem-border-br-base-secondary-invert-hover hover:bg-sem-surface-sf-base-secondary-hover aria-expanded:border-sem-border-br-brand-b-primary aria-expanded:bg-sem-surface-sf-base-secondary-accent"
              },
              actions: {
                onChange: {
                  type: "custom",
                  handler: "changeLanguage"
                }
              }
            }
          ]
        }
      };

            console.log('[SidebarRendererPresenter] Button texts in default config:', {
        home: this.getTranslation("nav.home", "Home"),
        store: this.getTranslation("nav.store", "Store"),
        patchNotes: this.getTranslation("nav.patchNotes", "Patch Notes"),
        dailyRewards: this.getTranslation("nav.dailyRewards", "Daily Rewards"),
        loyaltyProgram: this.getTranslation("nav.loyaltyProgram", "Loyalty Program"),
        news: this.getTranslation("nav.news", "News"),
        updates: this.getTranslation("nav.updates", "Updates"),
        events: this.getTranslation("nav.events", "Events"),
        currentLanguage: this._languageCode,
        translationsCount: Object.keys(this._translations).length
      });

      const result = this._convertToPageConfig(defaultSidebarLayout, 'sidebar');
            return result;
    } catch (error) {
            return null;
    }
  }

  
  public getRightSidebar(): PageConfig | null {
    if (!this._configs) {
      return null;
    }
    return this._convertToPageConfig(this._configs.rightSidebar, 'right-sidebar');
  }

  
  public getStore(): PageConfig | null {
    if (!this._configs) {
      return null;
    }
    return this._convertToPageConfig(this._configs.store, 'store');
  }

  
  public isReady(): boolean {
    return this._configs !== null;
  }

  
  /**
   * Гарантирует наличие узла селектора языка (`language-selector`)
   * в layout конфигурации sidebar, не ломая пользовательский layout.
   */
  private _ensureLanguageSelectorInSidebarConfig(config: any): any {
    try {
      if (!config || !config.layout) {
        return config;
      }

      const layout = config.layout;

      // Если уже есть узел с id "language-selector" — ничего не делаем
      if (this._hasNodeWithId(layout, 'language-selector')) {
        return config;
      }

      const languageSelectorNode = {
        id: 'language-selector',
        type: 'Select',
        props: {
          // options будут переопределены из ActionContext.availableLanguages,
          // но оставим дефолт как fallback
          options: [
            { value: 'en', label: 'English (English)' },
            { value: 'ar', label: 'Arabic (العربية)' },
          ],
          placeholder: '🌐 Language',
          value: this._languageCode,
        },
        styles: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          marginTop: 'auto',
          backgroundColor: 'surface',
          textColor: '#FFFFFF',
          borderRadius: '8px',
          marginBottom: '4px',
          className:
            'group/select-trigger flex min-h-9 w-full min-w-48 cursor-pointer items-center justify-between rounded-input border border-sem-border-br-base-secondary-invert bg-sem-surface-sf-base-secondary px-3 py-2 text-left font-medium text-caption-lg text-sem-text-tx-quaternary shadow-sm transition-colors hover:cursor-pointer hover:border-sem-border-br-base-secondary-invert-hover hover:bg-sem-surface-sf-base-secondary-hover aria-expanded:border-sem-border-br-brand-b-primary aria-expanded:bg-sem-surface-sf-base-secondary-accent',
        },
        actions: {
          onChange: {
            type: 'custom',
            handler: 'changeLanguage',
          },
        },
      };

      // Если у корня уже есть children — добавляем селектор в конец
      if (Array.isArray(layout.children)) {
        return {
          ...config,
          layout: {
            ...layout,
            children: [...layout.children, languageSelectorNode],
          },
        };
      }

      // Иначе не рискуем ломать структуру, возвращаем как есть
      return config;
    } catch {
      // В случае любых неожиданностей не трогаем исходный конфиг
      return config;
    }
  }

  private _hasNodeWithId(node: any, id: string): boolean {
    if (!node) return false;
    if (node.id === id) return true;
    if (!Array.isArray(node.children)) return false;
    return node.children.some((child: any) => this._hasNodeWithId(child, id));
  }

  
  private _convertToPageConfig(layoutConfig: any, type: string): PageConfig | null {
    try {
      console.log('[SidebarRendererPresenter] _convertToPageConfig called for', type, 'with config:', {
        hasConfig: !!layoutConfig,
        hasTheme: !!layoutConfig?.theme,
        hasLayout: !!layoutConfig?.layout,
        configKeys: layoutConfig ? Object.keys(layoutConfig) : [],
        themeKeys: layoutConfig?.theme ? Object.keys(layoutConfig.theme) : [],
        layoutKeys: layoutConfig?.layout ? Object.keys(layoutConfig.layout) : []
      });

            if (!layoutConfig || !layoutConfig.theme || !layoutConfig.layout) {
                return null;
      }

      const themeResult = ThemeConfig.create({
        colors: layoutConfig.theme.colors,
        spacing: layoutConfig.theme.spacing,
      });

      if (!themeResult.isSuccess) {
                return null;
      }

      const componentNodeResult = this._convertToComponentNode(layoutConfig.layout);
      if (!componentNodeResult.isSuccess) {
                return null;
      }

      const pageConfigResult = PageConfig.create({
        type,
        version: layoutConfig.version,
        theme: themeResult.value!,
        layout: componentNodeResult.value!,
      });

      if (!pageConfigResult.isSuccess) {
                return null;
      }

      return pageConfigResult.value!;
    } catch (error) {
            return null;
    }
  }

  
  private _convertToComponentNode(nodeData: any): Result<ComponentNode, AppLayoutError> {
    const children: ComponentNode[] = [];

    if (Array.isArray(nodeData.children)) {
      for (const childData of nodeData.children) {
        const childResult = this._convertToComponentNode(childData);
        if (childResult.isFailure()) {
          return Result.error(childResult.error);
        }
        if (childResult.isSuccess) {
          children.push(childResult.value!);
        }
      }
    }

        const normalizedType = this._normalizeComponentType(nodeData.type);

    // Apply active-state aware styling for sidebar buttons:
    // backgroundColor from external config should only be visible when
    // the corresponding button is "active" for the current URL.
    let processedStyles = (nodeData.styles || {}) as any;

    if (normalizedType === 'Button') {
      // Определяем активность кнопки по нескольким признакам:
      // 1) pageSlug в props (основной путь для конфигов из UI‑builder)
      // 2) onClick.url (navigate-экшен)
      // 3) fallback: тип кнопки по id + _isButtonActive
      let isActiveForPath = false;

      // 1) pageSlug => путь вида "/store"
      if (nodeData.props && typeof nodeData.props.pageSlug === 'string') {
        const slug: string = nodeData.props.pageSlug;
        const rawSlugPath = slug.split('?')[0].split('#')[0];
        // Нормализуем: гарантируем ровно один ведущий "/"
        const slugPath =
          '/' +
          rawSlugPath
            .replace(/^\/+/, '') // убираем все ведущие "/"
            .trim();

        if (slugPath === this._currentPathname) {
          isActiveForPath = true;
        }
      }

      // 2) onClick.url navigate
      if (
        !isActiveForPath &&
        nodeData.actions?.onClick?.type === 'navigate' &&
        typeof nodeData.actions.onClick.url === 'string'
      ) {
        const rawUrl: string = nodeData.actions.onClick.url;
        const pathOnly = rawUrl.startsWith('http')
          ? new URL(rawUrl).pathname
          : `/${rawUrl.replace(/^\//, '').split('?')[0].split('#')[0]}`;
        if (pathOnly === this._currentPathname) {
          isActiveForPath = true;
        }
      }

      // 2b) onClick.handler custom (navigateToXxx)
      if (
        !isActiveForPath &&
        nodeData.actions?.onClick?.type === 'custom' &&
        typeof nodeData.actions.onClick.handler === 'string'
      ) {
        const handlerName: string = nodeData.actions.onClick.handler;
        let handlerPath: string | null = null;

        switch (handlerName) {
          case 'navigateToHome':
            handlerPath = '/';
            break;
          case 'navigateToStore':
            handlerPath = '/store';
            break;
          case 'navigateToPatchNotes':
            handlerPath = '/patch-notes';
            break;
          case 'navigateToDailyRewards':
            handlerPath = '/daily-rewards';
            break;
          case 'navigateToLoyaltyProgram':
            handlerPath = '/loyalty-program';
            break;
          case 'navigateToNews':
            handlerPath = '/news';
            break;
          case 'navigateToUpdates':
            handlerPath = '/updates';
            break;
          case 'navigateToEvents':
            handlerPath = '/events';
            break;
          default:
            handlerPath = null;
            break;
        }

        if (handlerPath && handlerPath === this._currentPathname) {
          isActiveForPath = true;
        }
      }

      // 3) fallback: сопоставление по id как раньше
      if (!isActiveForPath) {
        let buttonType = this._getButtonTypeFromId(nodeData.id);

        // Доп. fallback: попытка вывести тип из pageSlug
        if (!buttonType && nodeData.props && typeof nodeData.props.pageSlug === 'string') {
          const slug: string = nodeData.props.pageSlug;
          switch (slug) {
            case 'home':
              buttonType = 'home';
              break;
            case 'store':
              buttonType = 'store';
              break;
            case 'patch-notes':
              buttonType = 'patch-notes';
              break;
            case 'daily-rewards':
              buttonType = 'daily-rewards';
              break;
            case 'loyalty-program':
              buttonType = 'loyalty-program';
              break;
            case 'news':
              buttonType = 'news';
              break;
            case 'updates':
              buttonType = 'updates';
              break;
            case 'events':
              buttonType = 'events';
              break;
            default:
              break;
          }
        }

        if (buttonType) {
          isActiveForPath = this._isButtonActive(buttonType);
        }
      }

      if (!isActiveForPath) {
        // Для неактивных кнопок убираем backgroundColor, чтобы
        // визуально "selected" был только у текущего маршрута.
        const { backgroundColor, ...rest } = processedStyles;
        processedStyles = { ...rest };
      } else {
        // Для активной кнопки гарантируем фон:
        // 1) если в конфиге есть backgroundColor — используем его;
        // 2) иначе используем hoverBackgroundColor как selected‑фон;
        // 3) иначе дефолтный "primary".
        if (!processedStyles.backgroundColor) {
          if (processedStyles.hoverBackgroundColor) {
            processedStyles = {
              ...processedStyles,
              backgroundColor: processedStyles.hoverBackgroundColor,
            };
          } else {
            processedStyles = {
              ...processedStyles,
              backgroundColor: 'primary',
            };
          }
        }

        // Чтобы hover‑эффект был виден даже для активной кнопки,
        // прокидываем hoverBackgroundColor в CSS custom property,
        // которую UI renderer использует в _createButtonHoverHandlers.
        if (processedStyles.hoverBackgroundColor) {
          const hoverColor =
            typeof processedStyles.hoverBackgroundColor === 'string'
              ? processedStyles.hoverBackgroundColor
              : String(processedStyles.hoverBackgroundColor);

          processedStyles = {
            ...processedStyles,
            // Interpret in StyleBuilder as backgroundColor,
            // но дублируем в custom property для JS‑hover.
            '--hover-background-color': hoverColor,
          } as any;
        }
      }
    }

    // Apply localization to text props when using i18n-style keys, e.g. "i18n:nav.store"
    let processedProps = (nodeData.props || {}) as any;
    if (processedProps && typeof processedProps.text === 'string') {
      const rawText: string = processedProps.text;
      if (rawText.startsWith('i18n:')) {
        const key = rawText.substring('i18n:'.length);
        const translated = this.getTranslation(key, rawText);
        processedProps = { ...processedProps, text: translated };
      }
    }

    return ComponentNode.create({
      id: nodeData.id,
      type: normalizedType,
      props: processedProps,
      styles: processedStyles,
      children,
      actions: nodeData.actions,
    });
  }

  private _normalizeComponentType(type: string): string {
        if (!type) return type;
    const firstChar = type[0]?.toUpperCase() || '';
    const rest = type.slice(1);
    return firstChar + rest;
  }

  public onTranslationsConfig(
    translations: Record<string, string>,
    languageCode: string,
    direction: 'ltr' | 'rtl'
  ): void {
    const navKeys = Object.keys(translations).filter(key => key.startsWith('nav.'));
    console.log('[SidebarRendererPresenter] onTranslationsConfig called', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length,
      availableKeys: navKeys,
      allNavKeys: navKeys,
      navHome: translations['nav.home'],
      navStore: translations['nav.store'],
      navPatchNotes: translations['nav.patchNotes'],
      navDailyRewards: translations['nav.dailyRewards'],
      navLoyaltyProgram: translations['nav.loyaltyProgram'],
      navNews: translations['nav.news'],
      navUpdates: translations['nav.updates'],
      navEvents: translations['nav.events'],
            allNavTranslations: navKeys.reduce((acc, key) => {
        acc[key] = translations[key];
        return acc;
      }, {} as Record<string, string>)
    });

        this._translations = translations;
    this._languageCode = languageCode;
    this._direction = direction;

    console.log('[SidebarRendererPresenter] Translations config updated for sidebar', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length,
      availableKeys: Object.keys(translations).filter(key => key.startsWith('nav.'))
    });

                this._listeners.forEach(listener => listener());
      }

  public getTranslation(key: string, fallback?: string): string {
    return this._translations[key] || fallback || key;
  }

  public getDirection(): 'ltr' | 'rtl' {
    return this._direction;
  }

  public getLanguageCode(): string {
    return this._languageCode;
  }
}

