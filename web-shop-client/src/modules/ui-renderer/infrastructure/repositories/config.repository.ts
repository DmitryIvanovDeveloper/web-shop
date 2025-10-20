import { injectable, inject } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { Result } from '../../../../shared/domain/result/result';
import type { ConfigRepositoryPort } from '../../application/ports/config-repository.port';
import { PageConfig } from '../../domain/value-objects/page-config.value-object';
import { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';
import { ComponentNode } from '../../domain/value-objects/component-node.value-object';
import { UIRendererError } from '../../domain/errors/ui-renderer.error';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { ConfigDTO, ComponentNodeDTO, StyleConfig, SpacingValue, ColorKey, ActionsConfig, ActionConfig } from '../../domain/types';

@injectable()
export class ConfigRepository implements ConfigRepositoryPort {
  private static readonly MAX_RECURSION_DEPTH = 10;

  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient
  ) {}

  public async getPageConfig(pageType: string): Promise<Result<PageConfig, UIRendererError>> {
    try {
      console.log('[ConfigRepository] Loading config for pageType:', pageType);
      // ✅ Загружаем конфигурацию через HttpClientMock
      // HttpClientMock мапит: /api/ui-renderer/configs/sidebar -> /mocks/api/ui-renderer/configs/sidebar.json
      const response = await this._httpClient.get<ConfigDTO>(`/api/ui-renderer/configs/${pageType}`);
      console.log('[ConfigRepository] Response received:', response);

      if (response.status !== 200 || !response.data) {
        return Result.error(new UIRendererError('Failed to load config', 'DATA_LOADING_FAILED'));
      }

      const data = response.data;
      console.log('[ConfigRepository] Data extracted:', data);

      // ✅ Runtime валидация
      if (!this._isValidConfigDTO(data)) {
        console.error('[ConfigRepository] Invalid config format');
        return Result.error(new UIRendererError('Invalid config format', 'INVALID_CONFIG'));
      }

      const themeResult = ThemeConfig.create({
        colors: data.theme.colors,
        spacing: data.theme.spacing,
      });

      if (!themeResult.isSuccess()) {
        return Result.error(themeResult.error!);
      }

      console.log('[ConfigRepository] Creating layout...');
      const layoutResult = this._createComponentNode(data.layout, 0);

      if (!layoutResult.isSuccess()) {
        console.error('[ConfigRepository] Layout creation failed:', layoutResult.error);
        return Result.error(layoutResult.error!);
      }

      console.log('[ConfigRepository] Creating page config...');
      // Если мы дошли сюда, значит оба результата Success
      const pageConfigResult = PageConfig.create({
        type: pageType,
        version: data.version,
        theme: themeResult.data,
        layout: layoutResult.data,
      });
      
      if (!pageConfigResult.isSuccess()) {
        console.error('[ConfigRepository] Page config creation failed:', pageConfigResult.error);
        return Result.error(pageConfigResult.error!);
      }
      
      console.log('[ConfigRepository] Successfully loaded config for:', pageType);
      return pageConfigResult;
    } catch (error) {
      return Result.error(
        new UIRendererError(`Error loading config: ${error}`, 'DATA_LOADING_FAILED')
      );
    }
  }

  // Type guard для ConfigDTO
  private _isValidConfigDTO(data: unknown): data is ConfigDTO {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj.version === 'string' &&
      this._isValidThemeDTO(obj.theme) &&
      this._isValidComponentNodeDTO(obj.layout)
    );
  }

  // Type guard для ThemeDTO
  private _isValidThemeDTO(theme: unknown): boolean {
    if (!theme || typeof theme !== 'object') return false;
    const obj = theme as Record<string, unknown>;
    return (
      typeof obj.colors === 'object' &&
      obj.colors !== null &&
      Array.isArray(obj.spacing) &&
      obj.spacing.every((s) => typeof s === 'number')
    );
  }

  // Type guard для ComponentNodeDTO
  private _isValidComponentNodeDTO(node: unknown): boolean {
    if (!node || typeof node !== 'object') return false;
    const obj = node as Record<string, unknown>;
    return typeof obj.id === 'string' && typeof obj.type === 'string';
  }

  private _createComponentNode(
    nodeData: ComponentNodeDTO,
    depth: number
  ): Result<ComponentNode, UIRendererError> {
    if (depth > ConfigRepository.MAX_RECURSION_DEPTH) {
      return Result.error(
        new UIRendererError('Max recursion depth exceeded', 'INVALID_CONFIG')
      );
    }

    // Валидация типа компонента - разрешаем все зарегистрированные типы
    const allowedTypes = ['Button', 'Container', 'Badge', 'Image', 'Text', 'InputText', 'UniversalInput', 'Input', 'Grid', 'DataGrid', 'OfferCard', 'OffersList', 'Popup'];
    if (!allowedTypes.includes(nodeData.type)) {
      return Result.error(
        new UIRendererError(`Unknown component type: ${nodeData.type}`, 'INVALID_CONFIG')
      );
    }

    const children: ComponentNode[] = [];

    if (Array.isArray(nodeData.children)) {
      for (const childData of nodeData.children) {
        if (!this._isValidComponentNodeDTO(childData)) {
          return Result.error(new UIRendererError('Invalid child node', 'INVALID_CONFIG'));
        }
        const childResult = this._createComponentNode(childData, depth + 1);
        if (childResult.isFailure()) {
          return Result.error(childResult.error);
        }
        if (childResult.isSuccess()) {
          children.push(childResult.data);
        }
      }
    }

    // Типобезопасное извлечение props
    const props = this._extractProps(nodeData.type, nodeData.props);
    const styles = this._extractStyles(nodeData.styles);
    const actions = this._extractActions(nodeData.actions);

    return ComponentNode.create({
      id: nodeData.id,
      type: nodeData.type,
      props,
      styles,
      children,
      actions,
    });
  }

  // Универсальное извлечение props
  private _extractProps(
    type: string,
    rawProps: Record<string, unknown> | undefined
  ): Record<string, any> {
    // Просто возвращаем все props как есть - компоненты сами знают, что с ними делать
    return rawProps || {};
  }

  private _extractBadgeVariant(variant: unknown): 'discount' | 'limit' | 'timer' | 'rarity' | undefined {
    if (typeof variant === 'string' && ['discount', 'limit', 'timer', 'rarity'].includes(variant)) {
      return variant as 'discount' | 'limit' | 'timer' | 'rarity';
    }
    return undefined;
  }

  // Типобезопасное извлечение styles
  private _extractStyles(rawStyles: Record<string, unknown> | undefined): StyleConfig {
    return {
      // Layout
      display: this._extractDisplay(rawStyles?.display),
      flexDirection: this._extractFlexDirection(rawStyles?.flexDirection),
      justifyContent: this._extractJustifyContent(rawStyles?.justifyContent),
      alignItems: this._extractAlignItems(rawStyles?.alignItems),
      flex: typeof rawStyles?.flex === 'string' || typeof rawStyles?.flex === 'number' ? rawStyles.flex : undefined,
      gap: typeof rawStyles?.gap === 'number' ? (rawStyles.gap as SpacingValue) : undefined,
      
      // Grid
      gridTemplateColumns: typeof rawStyles?.gridTemplateColumns === 'string' ? rawStyles.gridTemplateColumns : undefined,
      
      // Spacing
      padding: typeof rawStyles?.padding === 'number' ? (rawStyles.padding as SpacingValue) : undefined,
      paddingX: typeof rawStyles?.paddingX === 'number' ? (rawStyles.paddingX as SpacingValue) : undefined,
      paddingY: typeof rawStyles?.paddingY === 'number' ? (rawStyles.paddingY as SpacingValue) : undefined,
      margin: typeof rawStyles?.margin === 'string' ? rawStyles.margin : (typeof rawStyles?.margin === 'number' ? (rawStyles.margin as SpacingValue) : undefined),
      marginTop: typeof rawStyles?.marginTop === 'number' ? (rawStyles.marginTop as SpacingValue) : undefined,
      marginBottom: typeof rawStyles?.marginBottom === 'number' ? (rawStyles.marginBottom as SpacingValue) : undefined,
      
      // Colors
      backgroundColor: typeof rawStyles?.backgroundColor === 'string' ? rawStyles.backgroundColor : undefined,
      textColor: typeof rawStyles?.textColor === 'string' ? rawStyles.textColor : undefined,
      
      // Typography
      fontSize: this._extractFontSize(rawStyles?.fontSize),
      fontWeight: this._extractFontWeight(rawStyles?.fontWeight),
      fontFamily: typeof rawStyles?.fontFamily === 'string' ? rawStyles.fontFamily : undefined,
      textAlign: this._extractTextAlign(rawStyles?.textAlign),
      textDecoration: this._extractTextDecoration(rawStyles?.textDecoration),
      
      // Size
      width: typeof rawStyles?.width === 'string' || typeof rawStyles?.width === 'number' ? rawStyles.width : undefined,
      height: typeof rawStyles?.height === 'string' || typeof rawStyles?.height === 'number' ? rawStyles.height : undefined,
      minHeight: typeof rawStyles?.minHeight === 'string' || typeof rawStyles?.minHeight === 'number' ? rawStyles.minHeight : undefined,
      maxWidth: typeof rawStyles?.maxWidth === 'string' || typeof rawStyles?.maxWidth === 'number' ? rawStyles.maxWidth : undefined,
      maxHeight: typeof rawStyles?.maxHeight === 'string' || typeof rawStyles?.maxHeight === 'number' ? rawStyles.maxHeight : undefined,
      
      // Position
      position: this._extractPosition(rawStyles?.position),
      top: typeof rawStyles?.top === 'number' ? (rawStyles.top as SpacingValue) : undefined,
      left: typeof rawStyles?.left === 'number' ? (rawStyles.left as SpacingValue) : undefined,
      right: typeof rawStyles?.right === 'number' ? (rawStyles.right as SpacingValue) : undefined,
      bottom: typeof rawStyles?.bottom === 'number' ? (rawStyles.bottom as SpacingValue) : undefined,
      zIndex: typeof rawStyles?.zIndex === 'number' ? rawStyles.zIndex : undefined,
      
      // Visual
      borderRadius: typeof rawStyles?.borderRadius === 'number' ? (rawStyles.borderRadius as SpacingValue) : undefined,
      border: typeof rawStyles?.border === 'string' ? rawStyles.border : undefined,
      overflow: this._extractOverflow(rawStyles?.overflow),
      objectFit: this._extractObjectFit(rawStyles?.objectFit),
      filter: typeof rawStyles?.filter === 'string' ? rawStyles.filter : undefined,
      
      // Background
      backgroundImage: typeof rawStyles?.backgroundImage === 'string' ? rawStyles.backgroundImage : undefined,
      backgroundSize: typeof rawStyles?.backgroundSize === 'string' ? rawStyles.backgroundSize : undefined,
      backgroundPosition: typeof rawStyles?.backgroundPosition === 'string' ? rawStyles.backgroundPosition : undefined,
      backgroundRepeat: this._extractBackgroundRepeat(rawStyles?.backgroundRepeat),
    };
  }

  private _extractDisplay(display: unknown): 'flex' | 'grid' | 'block' | 'inline' | 'inline-flex' | undefined {
    if (typeof display === 'string' && ['flex', 'grid', 'block', 'inline', 'inline-flex'].includes(display)) {
      return display as 'flex' | 'grid' | 'block' | 'inline' | 'inline-flex';
    }
    return undefined;
  }

  private _extractFlexDirection(flexDirection: unknown): 'row' | 'column' | undefined {
    if (typeof flexDirection === 'string' && ['row', 'column'].includes(flexDirection)) {
      return flexDirection as 'row' | 'column';
    }
    return undefined;
  }

  private _extractJustifyContent(justifyContent: unknown): 'center' | 'space-between' | 'flex-start' | 'flex-end' | undefined {
    if (typeof justifyContent === 'string' && ['center', 'space-between', 'flex-start', 'flex-end'].includes(justifyContent)) {
      return justifyContent as 'center' | 'space-between' | 'flex-start' | 'flex-end';
    }
    return undefined;
  }

  private _extractAlignItems(alignItems: unknown): 'center' | 'flex-start' | 'flex-end' | 'stretch' | undefined {
    if (typeof alignItems === 'string' && ['center', 'flex-start', 'flex-end', 'stretch'].includes(alignItems)) {
      return alignItems as 'center' | 'flex-start' | 'flex-end' | 'stretch';
    }
    return undefined;
  }

  private _extractFontSize(fontSize: unknown): 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | undefined {
    if (typeof fontSize === 'string' && ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'].includes(fontSize)) {
      return fontSize as 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    }
    return undefined;
  }

  private _extractFontWeight(fontWeight: unknown): 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | undefined {
    if (typeof fontWeight === 'string' && ['normal', 'medium', 'semibold', 'bold', 'extrabold'].includes(fontWeight)) {
      return fontWeight as 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    }
    return undefined;
  }

  private _extractTextAlign(textAlign: unknown): 'left' | 'center' | 'right' | undefined {
    if (typeof textAlign === 'string' && ['left', 'center', 'right'].includes(textAlign)) {
      return textAlign as 'left' | 'center' | 'right';
    }
    return undefined;
  }

  private _extractTextDecoration(textDecoration: unknown): 'none' | 'line-through' | 'underline' | undefined {
    if (typeof textDecoration === 'string' && ['none', 'line-through', 'underline'].includes(textDecoration)) {
      return textDecoration as 'none' | 'line-through' | 'underline';
    }
    return undefined;
  }

  private _extractPosition(position: unknown): 'relative' | 'absolute' | 'fixed' | 'sticky' | undefined {
    if (typeof position === 'string' && ['relative', 'absolute', 'fixed', 'sticky'].includes(position)) {
      return position as 'relative' | 'absolute' | 'fixed' | 'sticky';
    }
    return undefined;
  }

  private _extractOverflow(overflow: unknown): 'hidden' | 'visible' | 'scroll' | undefined {
    if (typeof overflow === 'string' && ['hidden', 'visible', 'scroll'].includes(overflow)) {
      return overflow as 'hidden' | 'visible' | 'scroll';
    }
    return undefined;
  }

  private _extractObjectFit(objectFit: unknown): 'contain' | 'cover' | undefined {
    if (typeof objectFit === 'string' && ['contain', 'cover'].includes(objectFit)) {
      return objectFit as 'contain' | 'cover';
    }
    return undefined;
  }

  private _extractBackgroundRepeat(backgroundRepeat: unknown): 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y' | undefined {
    if (typeof backgroundRepeat === 'string' && ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'].includes(backgroundRepeat)) {
      return backgroundRepeat as 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
    }
    return undefined;
  }

  // Типобезопасное извлечение actions
  private _extractActions(
    rawActions: Record<string, unknown> | undefined
  ): ActionsConfig | undefined {
    if (!rawActions) return undefined;
    
    const onClick = this._extractActionConfig(rawActions.onClick);
    
    return onClick ? { onClick } : undefined;
  }

  private _extractActionConfig(
    raw: unknown
  ): ActionConfig | undefined {
    if (!raw || typeof raw !== 'object') return undefined;
    
    const obj = raw as Record<string, unknown>;
    
    if (obj.type === 'loadPopup' && typeof obj.config === 'string') {
      return { type: 'loadPopup', config: obj.config };
    }
    
    if (obj.type === 'navigate' && typeof obj.url === 'string') {
      return { type: 'navigate', url: obj.url };
    }
    
    if (obj.type === 'custom' && typeof obj.handler === 'string') {
      return { type: 'custom', handler: obj.handler };
    }
    
    return undefined;
  }
}

