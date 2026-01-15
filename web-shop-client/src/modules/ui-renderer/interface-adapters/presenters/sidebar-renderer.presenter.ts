import { injectable, inject } from 'inversify';
import type { UIRendererModuleConfig } from '../../../../shared/config/app-config.types';
import { PageConfig } from '../../domain/value-objects/page-config.value-object';
import { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';
import { ComponentNode } from '../../domain/value-objects/component-node.value-object';
import { Result } from '../../../../shared/domain/result/result';
import { UIRendererError } from '../../domain/errors/ui-renderer.error';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { TranslationsConfigEvent } from '../../../localization/domain/events/translations-config.event';

@injectable()
export class SidebarRendererPresenter {
  private _configs: UIRendererModuleConfig | null = null;
  private _listeners: Array<() => void> = [];

  constructor(
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {
    this._initializeEventSubscriptions();
  }

  private _initializeEventSubscriptions(): void {
    // Event handlers are registered in DI container and will be called automatically
    // when TranslationsConfigEvent is published
    this._logger.info('[SidebarRendererPresenter] Event subscriptions initialized');
  }

  /**
   * Force re-render by notifying all listeners
   * Used by event handlers to trigger UI updates
   */
  public notifyListeners(): void {
    this._logger.debug('[SidebarRendererPresenter] Notifying listeners');
    this._listeners.forEach(listener => listener());
  }

  /**
   * Handle language change event and force re-render
   */
  public onLanguageChanged(languageCode: string, direction: 'ltr' | 'rtl'): void {
    this._logger.info('[SidebarRendererPresenter] Language changed, forcing re-render', {
      languageCode,
      direction
    });

    // Store language info if needed for future use
    this._currentLanguageCode = languageCode;
    this._currentDirection = direction;

    // Force re-render by notifying listeners
    this.notifyListeners();
  }

  private _currentLanguageCode: string = 'en';
  private _currentDirection: 'ltr' | 'rtl' = 'ltr';

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
    console.log('[SidebarRendererPresenter] setConfigs called, listeners count:', this._listeners.length);
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
      return null;
    }
    return this._convertToPageConfig(this._configs.sidebar, 'sidebar');
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
  private _convertToComponentNode(nodeData: any): Result<ComponentNode, UIRendererError> {
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

