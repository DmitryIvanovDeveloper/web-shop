import { injectable, inject } from 'inversify';
import type { UIRendererModuleConfig } from '../../../../shared/config/app-config.types';
import { PageConfig } from '../../domain/value-objects/page-config.value-object';
import { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';
import { ComponentNode } from '../../domain/value-objects/component-node.value-object';
import { Result } from '../../../../shared/result/result';
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
            this._logger.info('[SidebarRendererPresenter] Event subscriptions initialized');
  }

  
  public notifyListeners(): void {
    this._logger.debug('[SidebarRendererPresenter] Notifying listeners');
    this._listeners.forEach(listener => listener());
  }

  
  public onLanguageChanged(languageCode: string, direction: 'ltr' | 'rtl'): void {
    this._logger.info('[SidebarRendererPresenter] Language changed, forcing re-render', {
      languageCode,
      direction
    });

        this._currentLanguageCode = languageCode;
    this._currentDirection = direction;

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

  
  public setConfigs(configs: UIRendererModuleConfig): void {
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
    if (!this._configs) {
      return null;
    }
    return this._convertToPageConfig(this._configs.sidebar, 'sidebar');
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

  
  private _convertToPageConfig(layoutConfig: any, type: string): PageConfig | null {
    try {
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

  
  private _convertToComponentNode(nodeData: any): Result<ComponentNode, UIRendererError> {
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
        if (!type) return type;
    const firstChar = type[0]?.toUpperCase() || '';
    const rest = type.slice(1);
    return firstChar + rest;
  }
}

