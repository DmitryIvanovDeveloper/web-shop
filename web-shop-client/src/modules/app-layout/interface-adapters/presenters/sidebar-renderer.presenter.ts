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

  public readonly labels = {
    loading: 'Loading...',
    error: 'Failed to load configuration',
    notReady: 'Configuration not loaded yet',
    store: 'Store',
  } as const;

  /**
   * Устанавливает конфигурации из AppConfig (вызывается через EventHandler)
   */
  public setConfigs(configs: UIRendererModuleConfig): void {
    this._configs = configs;
    // Оповещаем всех подписчиков о готовности конфига
    this._listeners.forEach(listener => listener());
  }

  /**
   * Подписка на изменения конфигурации
   */
  public subscribe(listener: () => void): () => void {
    this._listeners.push(listener);
    
    // Если конфиг уже загружен, сразу вызываем listener
    if (this._configs !== null) {
      listener();
    }
    
    // Возвращаем функцию для отписки
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  /**
   * Возвращает конфигурацию для Sidebar
   */
  public getSidebar(): PageConfig | null {
    // TEMPORARY: Always use default config to ensure patch-notes button is visible
    console.log('[SidebarRendererPresenter] getSidebar called');
    const result = this._getDefaultSidebarConfig();
    console.log('[SidebarRendererPresenter] getSidebar result:', !!result);
    return result;

    // TODO: Re-enable merge logic after testing
    // // Always start with default config to ensure buttons are present
    // const defaultConfig = this._getDefaultSidebarConfig();
    //
    // if (!this._configs || !this._configs.sidebar) {
    //   return defaultConfig;
    // }
    //
    // // Merge with Supabase config, but only override styles/themes
    // return this._mergeSidebarConfigs(defaultConfig, this._configs.sidebar);
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

      // CRITICAL: Always keep children from default config to ensure buttons are present
      // Supabase config should NEVER override the button structure
      console.log('[SidebarRendererPresenter] Keeping default children (buttons) to ensure they are always present');

      // Explicitly ensure children are from default config
      mergedLayout.layout.children = defaultConfig.layout.children;
      console.log('[SidebarRendererPresenter] Explicitly set children from default config');

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
      console.log('[SidebarRendererPresenter] Using default sidebar configuration');
      console.log('[SidebarRendererPresenter] Default config children:', [
        'store-button',
        'patch-notes-button'
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
            padding: 8,
            backgroundColor: "surface",
            minHeight: "100vh",
            width: "100%"
          },
          children: [
            {
              id: "store-button",
              type: "Button",
              props: {
                text: "Store TEST",
                icon: "🛒",
                fullWidth: true
              },
              styles: {
                padding: 4,
                backgroundColor: "primary",
                textColor: "text",
                justifyContent: "flex-start"
              }
            },
            {
              id: "patch-notes-button",
              type: "Button",
              props: {
                text: "Patch Notes TEST",
                icon: "📋",
                fullWidth: true
              },
              styles: {
                padding: 4,
                backgroundColor: "surface",
                textColor: "text",
                justifyContent: "flex-start",
                hoverBackgroundColor: "primary"
              },
              actions: {
                onClick: {
                  type: "custom",
                  handler: "navigateToPatchNotes"
                }
              }
            }
          ]
        }
      };

      return this._convertToPageConfig(defaultSidebarLayout, 'sidebar');
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
      // Defensive guards: layoutConfig and its theme/layout must exist
      if (!layoutConfig || !layoutConfig.theme || !layoutConfig.layout) {
        console.warn('[SidebarRendererPresenter] Missing layoutConfig fields for', type, layoutConfig);
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
}

