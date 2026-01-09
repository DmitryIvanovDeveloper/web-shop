import { injectable } from 'inversify';
import type { UIRendererModuleConfig } from '../../../../shared/config/app-config.types';
import { PageConfig } from '../../domain/value-objects/page-config.value-object';
import { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';
import { ComponentNode } from '../../domain/value-objects/component-node.value-object';
import { Result } from '../../../../shared/domain/result/result';
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

  /**
   * Устанавливает текущий pathname для определения активной кнопки
   */
  public setCurrentPathname(pathname: string): void {
    console.log('[SidebarRendererPresenter] setCurrentPathname called with:', pathname, 'old value:', this._currentPathname);
    if (this._currentPathname === pathname) {
      console.log('[SidebarRendererPresenter] pathname unchanged, skipping update');
      return;
    }
    this._currentPathname = pathname;
    console.log('[SidebarRendererPresenter] _currentPathname updated to:', this._currentPathname);
    // Оповещаем подписчиков об изменении состояния
    this._listeners.forEach(listener => listener());
  }

  /**
   * Определяет, является ли кнопка активной на основе текущего пути
   */
  private _isButtonActive(buttonType: 'home' | 'store' | 'patch-notes'): boolean {
    const isActive = (() => {
      switch (buttonType) {
        case 'home':
          return this._currentPathname === '/';
        case 'store':
          return this._currentPathname === '/store';
        case 'patch-notes':
          return this._currentPathname === '/patch-notes';
        default:
          return false;
      }
    })();
    console.log(`[SidebarRendererPresenter] _isButtonActive(${buttonType}): currentPath=${this._currentPathname}, isActive=${isActive}`);
    return isActive;
  }

  /**
   * Возвращает тип кнопки по её ID для определения активности
   */
  private _getButtonTypeFromId(buttonId: string): 'home' | 'store' | 'patch-notes' | null {
    switch (buttonId) {
      case 'home-button':
        return 'home';
      case 'store-button':
        return 'store';
      case 'patch-notes-button':
        return 'patch-notes';
      default:
        return null;
    }
  }

  /**
   * Устанавливает конфигурации из AppConfig (вызывается через EventHandler)
   */
  public setConfigs(configs: UIRendererModuleConfig): void {
    console.log('[SidebarRendererPresenter] setConfigs called with configs:', !!configs, 'sidebar exists:', !!(configs as any)?.sidebar);
    this._configs = configs;
    // Оповещаем всех подписчиков о готовности конфига
    console.log('[SidebarRendererPresenter] Notifying', this._listeners.length, 'listeners');
    this._listeners.forEach(listener => listener());
  }

  /**
   * Подписка на изменения конфигурации
   */
  public subscribe(listener: () => void): () => void {
    console.log('[SidebarRendererPresenter] subscribe called, adding listener');
    this._listeners.push(listener);

    // Если конфиг уже загружен, сразу вызываем listener
    if (this._configs !== null) {
      console.log('[SidebarRendererPresenter] Config already loaded, calling listener immediately');
      listener();
    }

    // Возвращаем функцию для отписки
    return () => {
      console.log('[SidebarRendererPresenter] unsubscribe called, removing listener');
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  /**
   * Возвращает конфигурацию для Sidebar
   */
  public getSidebar(): PageConfig | null {
    console.log('[SidebarRendererPresenter] getSidebar called, currentPathname:', this._currentPathname, '_configs exists:', !!this._configs, '_configs.sidebar exists:', !!(this._configs?.sidebar));
    // Always start with default config to ensure buttons are present
    const defaultConfig = this._getDefaultSidebarConfig();
    console.log('[SidebarRendererPresenter] getSidebar: defaultConfig created:', !!defaultConfig);

    if (!this._configs || !this._configs.sidebar) {
      // No Supabase config, using default
      console.log('[SidebarRendererPresenter] getSidebar: no Supabase config, returning defaultConfig');
      return defaultConfig;
    }

    // Merge with Supabase config, but only override styles/themes
    console.log('[SidebarRendererPresenter] getSidebar: merging with Supabase config');
    const mergedConfig = this._mergeSidebarConfigs(defaultConfig, this._configs.sidebar);
    console.log('[SidebarRendererPresenter] getSidebar: merged config result:', !!mergedConfig);
    return mergedConfig;
  }

  /**
   * Объединяет дефолтную и Supabase конфигурации sidebar
   */
  private _mergeSidebarConfigs(defaultConfig: any, supabaseConfig: any): PageConfig | null {
    try {
      console.log('[SidebarRendererPresenter] Merging sidebar configs', {
        hasDefault: !!defaultConfig,
        hasSupabase: !!supabaseConfig,
        supabaseTheme: !!supabaseConfig?.theme,
        supabaseLayout: !!supabaseConfig?.layout
      });

      // Start with default layout structure
      const mergedLayout = { ...defaultConfig };

      // Override theme if present in Supabase config
      if (supabaseConfig.theme) {
        mergedLayout.theme = { ...mergedLayout.theme, ...supabaseConfig.theme };
        console.log('[SidebarRendererPresenter] Overrode theme from Supabase config');
      }

      // Override layout styles if present in Supabase config
      if (supabaseConfig.layout && supabaseConfig.layout.styles) {
        mergedLayout.layout = {
          ...mergedLayout.layout,
          styles: { ...mergedLayout.layout.styles, ...supabaseConfig.layout.styles }
        };
        console.log('[SidebarRendererPresenter] Overrode layout styles from Supabase config');
      }

      // CRITICAL: Use ONLY default buttons, apply Supabase styles by ID if available
      console.log('[SidebarRendererPresenter] Processing children merge');

      // Start with default children only
      const mergedChildren = defaultConfig.layout.children.map((defaultChild: any) => {
        // Find matching button in Supabase config by ID
        const supabaseChild = supabaseConfig.layout?.children?.find(
          (sc: any) => sc.id === defaultChild.id
        );

        if (supabaseChild && supabaseChild.styles) {
          console.log(`[SidebarRendererPresenter] Applying Supabase styles to default button: ${defaultChild.id}`, {
            defaultChildId: defaultChild.id,
            supabaseChildId: supabaseChild.id,
            defaultStyles: defaultChild.styles,
            supabaseStyles: supabaseChild.styles
          });

          // Merge styles but override backgroundColor for inactive buttons
          const mergedStyles = { ...defaultChild.styles, ...supabaseChild.styles };

          // Determine button type from ID and check if it's active
          const buttonType = this._getButtonTypeFromId(defaultChild.id);
          if (buttonType && !this._isButtonActive(buttonType)) {
            // Force transparent background for inactive buttons
            mergedStyles.backgroundColor = undefined;
            console.log(`[SidebarRendererPresenter] Forcing transparent background for inactive button: ${defaultChild.id}`);
          }

          return {
            ...defaultChild,
            styles: mergedStyles
          };
        } else {
          console.log(`[SidebarRendererPresenter] No Supabase styles for button: ${defaultChild.id}`, {
            hasSupabaseChild: !!supabaseChild,
            hasSupabaseStyles: supabaseChild?.styles
          });
        }

        // Return default button unchanged if no Supabase styles
        return defaultChild;
      });

      mergedLayout.layout.children = mergedChildren;
      console.log('[SidebarRendererPresenter] Final children count:', mergedChildren.length);

      console.log('[SidebarRendererPresenter] Final merged layout children count:', mergedLayout.layout?.children?.length || 0);

      const result = this._convertToPageConfig(mergedLayout, 'sidebar');
      console.log('[SidebarRendererPresenter] Conversion result:', !!result);

      return result;
    } catch (error) {
      console.error('[SidebarRendererPresenter] Failed to merge sidebar configs', error);
      // Fallback to default config
      return this._getDefaultSidebarConfig();
    }
  }

  /**
   * Возвращает конфигурацию sidebar по умолчанию
   */
  private _getDefaultSidebarConfig(): PageConfig | null {
    try {
      console.log('[SidebarRendererPresenter] _getDefaultSidebarConfig called, current _currentPathname:', this._currentPathname);

      console.log('[SidebarRendererPresenter] Default config children:', [
        'home-button',
        'store-button',
        'patch-notes-button',
        'localization-button'
      ]);

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
            // Fallback CSS classes when Supabase data is not available
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
                backgroundColor: this._isButtonActive('home') ? "primary" : undefined,
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0", // Всегда светло-синяя подсветка при hover
                hoverOpacity: 0.95, // Легкая прозрачность
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)", // Тень при hover
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out", // Плавная анимация
                // Fallback CSS classes for menu item button
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
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
                backgroundColor: this._isButtonActive('store') ? "primary" : undefined,
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0", // Всегда светло-синяя подсветка при hover
                hoverOpacity: 0.95, // Легкая прозрачность
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)", // Тень при hover
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out", // Плавная анимация
                // Fallback CSS classes for active menu item button
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50 bg-sem-component-sf-component-menu-store hover:bg-sem-component-sf-component-menu-store-hover data-[active=true]:bg-sem-component-sf-component-menu-store-accent"
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
                backgroundColor: this._isButtonActive('patch-notes') ? "primary" : undefined,
                textColor: "#FFFFFF",
                justifyContent: "flex-start",
                hoverBackgroundColor: "#5C6BC0", // Всегда светло-синяя подсветка при hover
                hoverOpacity: 0.95, // Легкая прозрачность
                hoverShadow: "0 4px 12px rgba(59, 90, 254, 0.15)", // Тень при hover
                borderRadius: "8px",
                marginBottom: "4px",
                transition: "all 0.2s ease-in-out", // Плавная анимация
                // Fallback CSS classes for menu item button
                className: "group/sidebar-button relative flex w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-3 py-2 transition-all select-none rounded-button border-0 disabled:cursor-not-allowed disabled:opacity-50  data-[active=true]:bg-sem-component-sf-component-menu-item-accent"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToPatchNotes"
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
                value: "en"
              },
              styles: {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                marginTop: "auto", // Push to bottom
                backgroundColor: "surface",
                textColor: "#FFFFFF",
                borderRadius: "8px",
                marginBottom: "4px",
                // Fallback CSS classes for language selector
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

      console.log('[SidebarRendererPresenter] About to convert defaultSidebarLayout:', {
        hasLayout: !!defaultSidebarLayout,
        hasTheme: !!defaultSidebarLayout.theme,
        hasSidebarLayout: !!defaultSidebarLayout.layout,
        layoutKeys: Object.keys(defaultSidebarLayout)
      });

      const result = this._convertToPageConfig(defaultSidebarLayout, 'sidebar');
      console.log('[SidebarRendererPresenter] _getDefaultSidebarConfig result:', !!result);
      return result;
    } catch (error) {
      console.error('[SidebarRendererPresenter] Failed to create default sidebar config', error);
      return null;
    }
  }

  /**
   * Возвращает конфигурацию для Right Sidebar
   */
  public getRightSidebar(): PageConfig | null {
    if (!this._configs) {
      return null;
    }
    return this._convertToPageConfig(this._configs.rightSidebar, 'right-sidebar');
  }

  /**
   * Возвращает конфигурацию для Store (main content)
   */
  public getStore(): PageConfig | null {
    if (!this._configs) {
      return null;
    }
    return this._convertToPageConfig(this._configs.store, 'store');
  }

  /**
   * Проверяет, загружены ли конфигурации
   */
  public isReady(): boolean {
    return this._configs !== null;
  }

  /**
   * Преобразует UILayoutConfig в PageConfig (Value Object)
   */
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

      // Defensive guards: layoutConfig and its theme/layout must exist
      if (!layoutConfig || !layoutConfig.theme || !layoutConfig.layout) {
        console.warn('[SidebarRendererPresenter] Missing layoutConfig fields for', type, {
          hasConfig: !!layoutConfig,
          hasTheme: !!layoutConfig?.theme,
          hasLayout: !!layoutConfig?.layout,
          layoutConfig
        });
        return null;
      }

      const themeResult = ThemeConfig.create({
        colors: layoutConfig.theme.colors,
        spacing: layoutConfig.theme.spacing,
      });

      if (!themeResult.isSuccess()) {
        console.error('[SidebarRendererPresenter] Failed to create ThemeConfig:', themeResult.error);
        return null;
      }

      const componentNodeResult = this._convertToComponentNode(layoutConfig.layout);
      if (!componentNodeResult.isSuccess()) {
        console.error('[SidebarRendererPresenter] Failed to create ComponentNode:', componentNodeResult.error);
        return null;
      }

      const pageConfigResult = PageConfig.create({
        type,
        version: layoutConfig.version,
        theme: themeResult.data,
        layout: componentNodeResult.data,
      });

      if (!pageConfigResult.isSuccess()) {
        console.error('[SidebarRendererPresenter] Failed to create PageConfig:', pageConfigResult.error);
        return null;
      }

      return pageConfigResult.data;
    } catch (error) {
      console.error('[SidebarRendererPresenter] Error converting config:', error);
      return null;
    }
  }

  /**
   * Рекурсивно преобразует ComponentNodeData в ComponentNode Value Object
   */
  private _convertToComponentNode(nodeData: any): Result<ComponentNode, AppLayoutError> {
    const children: ComponentNode[] = [];

    if (Array.isArray(nodeData.children)) {
      for (const childData of nodeData.children) {
        const childResult = this._convertToComponentNode(childData);
        if (childResult.isFailure()) {
          return Result.error(childResult.error);
        }
        if (childResult.isSuccess()) {
          children.push(childResult.data);
        }
      }
    }

    // Normalize component type to PascalCase (fix for OffersList/ProductsList)
    const normalizedType = this._normalizeComponentType(nodeData.type);

    return ComponentNode.create({
      id: nodeData.id,
      type: normalizedType,
      props: nodeData.props || {},
      styles: nodeData.styles || {},
      children,
      actions: nodeData.actions,
    });
  }

  private _normalizeComponentType(type: string): string {
    // PascalCase: First letter uppercase, rest as-is
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
    console.log('[SidebarRendererPresenter] onTranslationsConfig called', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length,
      availableKeys: Object.keys(translations).filter(key => key.startsWith('nav.')),
      navHome: translations['nav.home'],
      navStore: translations['nav.store'],
      navPatchNotes: translations['nav.patchNotes']
    });

    // Store translations for sidebar button text updates
    this._translations = translations;
    this._languageCode = languageCode;
    this._direction = direction;

    console.log('[SidebarRendererPresenter] Translations config updated for sidebar', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length,
      availableKeys: Object.keys(translations).filter(key => key.startsWith('nav.'))
    });

    // Notify listeners that translations have been updated
    // This will trigger re-render of sidebar with new translations
    console.log('[SidebarRendererPresenter] Notifying listeners, count:', this._listeners.length);
    this._listeners.forEach(listener => listener());
    console.log('[SidebarRendererPresenter] All listeners notified');
  }

  public getTranslation(key: string, fallback?: string): string {
    return this._translations[key] || fallback || key;
  }

  public getDirection(): 'ltr' | 'rtl' {
    return this._direction;
  }
}

