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
    if (!this._configs) {
      // Fallback configuration for sidebar when config is not loaded
      return this._getDefaultSidebarConfig();
    }
    return this._convertToPageConfig(this._configs.sidebar, 'sidebar');
  }

  /**
   * Возвращает конфигурацию sidebar по умолчанию
   */
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
                text: "Store",
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
                text: "Patch Notes",
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

