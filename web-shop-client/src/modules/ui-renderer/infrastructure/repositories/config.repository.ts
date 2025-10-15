import { injectable, inject } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { Result } from '../../../../shared/domain/result/result';
import type { ConfigRepositoryPort } from '../../application/ports/config-repository.port';
import { PageConfig } from '../../domain/value-objects/page-config.value-object';
import { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';
import { ComponentNode } from '../../domain/value-objects/component-node.value-object';
import { UIRendererError } from '../../domain/errors/ui-renderer.error';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { ConfigDTO, ComponentNodeDTO, ButtonProps, ContainerProps, StyleConfig, SpacingValue, ColorKey } from '../../domain/types';

@injectable()
export class ConfigRepository implements ConfigRepositoryPort {
  private static readonly MAX_RECURSION_DEPTH = 10;

  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient
  ) {}

  public async getPageConfig(pageType: string): Promise<Result<PageConfig, UIRendererError>> {
    try {
      // ✅ Загружаем конфигурацию через HttpClientMock
      // HttpClientMock мапит: /api/ui-renderer/configs/sidebar -> /mocks/api/ui-renderer/configs/sidebar.json
      const response = await this._httpClient.get<ConfigDTO>(`/api/ui-renderer/configs/${pageType}`);

      if (response.status !== 200 || !response.data) {
        return Result.error(new UIRendererError('Failed to load config', 'DATA_LOADING_FAILED'));
      }

      const data = response.data;

      // ✅ Runtime валидация
      if (!this._isValidConfigDTO(data)) {
        return Result.error(new UIRendererError('Invalid config format', 'INVALID_CONFIG'));
      }

      const themeResult = ThemeConfig.create({
        colors: data.theme.colors,
        spacing: data.theme.spacing,
      });

      if (!themeResult.isSuccess()) {
        return Result.error(themeResult.error!);
      }

      const layoutResult = this._createComponentNode(data.layout, 0);

      if (!layoutResult.isSuccess()) {
        return Result.error(layoutResult.error!);
      }

      // Если мы дошли сюда, значит оба результата Success
      return PageConfig.create({
        type: pageType,
        version: data.version,
        theme: themeResult.data,
        layout: layoutResult.data,
      });
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

    // Валидация типа компонента
    if (nodeData.type !== 'Button' && nodeData.type !== 'Container') {
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

    return ComponentNode.create({
      id: nodeData.id,
      type: nodeData.type,
      props,
      styles,
      children,
    });
  }

  // Типобезопасное извлечение props
  private _extractProps(
    type: string,
    rawProps: Record<string, unknown> | undefined
  ): ButtonProps | ContainerProps {
    if (type === 'Button') {
      return {
        text: typeof rawProps?.text === 'string' ? rawProps.text : undefined,
        icon: typeof rawProps?.icon === 'string' ? rawProps.icon : undefined,
        fullWidth: typeof rawProps?.fullWidth === 'boolean' ? rawProps.fullWidth : undefined,
      };
    }
    return {
      vertical: typeof rawProps?.vertical === 'boolean' ? rawProps.vertical : undefined,
    };
  }

  // Типобезопасное извлечение styles
  private _extractStyles(rawStyles: Record<string, unknown> | undefined): StyleConfig {
    const padding = rawStyles?.padding;
    const backgroundColor = rawStyles?.backgroundColor;
    const textColor = rawStyles?.textColor;

    return {
      padding: typeof padding === 'number' ? (padding as SpacingValue) : undefined,
      backgroundColor: typeof backgroundColor === 'string' ? (backgroundColor as ColorKey) : undefined,
      textColor: typeof textColor === 'string' ? (textColor as ColorKey) : undefined,
    };
  }
}

