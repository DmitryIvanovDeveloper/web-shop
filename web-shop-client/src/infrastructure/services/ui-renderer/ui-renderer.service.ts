/**
 * UI Renderer Service - универсальный сервис рендеринга UI
 * Infrastructure Service - НЕ модуль!
 * 
 * Принимает UIDescriptor от модулей и возвращает JSX.Element
 * НЕ владеет данными, НЕ загружает конфигурацию
 */

import { injectable, inject } from 'inversify';
import { createElement, cloneElement } from 'react';
import type { ComponentType } from 'react';
import type { UIRendererPort } from '../../../application/ports/ui-renderer.port';
import type { UIDescriptor } from '../../../shared/ui/ui-descriptor';
import type { ComponentNode } from '../../../shared/ui/component-node';
import type { ThemeConfig } from '../../../shared/ui/theme-config';
import type { ActionContext } from '../../../shared/ui/action-context';
import { UIComponentRegistry } from './component-registry.service';
import { UIStyleBuilder } from './style-builder.service';
import { UIActionHandler } from './action-handler.service';
import { ROOT_TYPES } from '../../bootstrap/types';
import type { Logger } from '../../../application/ports/logger.port';

@injectable()
export class UIRendererService implements UIRendererPort {
	private static readonly MAX_RECURSION_DEPTH = 20;

	constructor(
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger,
		@inject(ROOT_TYPES.UIComponentRegistry)
		private readonly _registry: UIComponentRegistry,
		@inject(ROOT_TYPES.UIStyleBuilder)
		private readonly _styleBuilder: UIStyleBuilder,
		@inject(ROOT_TYPES.UIActionHandler)
		private readonly _actionHandler: UIActionHandler
	) {}

	public renderUI({ layout, theme, context }: UIDescriptor): JSX.Element | null {
		this._logger.info('[UIRendererService] Rendering UI', {
			nodeType: layout.type,
			nodeId: layout.id
		});

		return this._renderNode(layout, theme, context, 0);
	}

	public registerComponent(type: string, component: ComponentType<unknown>): void {
		if (!type || type.trim() === '') {
			this._logger.error('[UIRendererService] Cannot register component with empty type');
			throw new Error('Component type cannot be empty');
		}

		this._logger.info('[UIRendererService] Registering component', { type });
		this._registry.register(type, component);
	}

	public hasComponent(type: string): boolean {
		return this._registry.hasComponent(type);
	}

	private _renderNode(
		node: ComponentNode,
		theme: ThemeConfig,
		context: ActionContext | undefined,
		depth: number
	): JSX.Element | null {
		if (depth > UIRendererService.MAX_RECURSION_DEPTH) {
			this._logger.error('[UIRendererService] Max recursion depth exceeded', {
				nodeId: node.id,
				depth
			});
			return null;
		}

		const Component = this._registry.getComponent(node.type);
		
		if (!Component) {
			this._logger.warn('[UIRendererService] Component not found', {
				type: node.type,
				availableTypes: this._registry.getRegisteredTypes()
			});
			return null;
		}

		// Build styles
		const className = this._styleBuilder.buildClassName(node.styles || {}, theme);
		const style = this._styleBuilder.buildInlineStyles(node.styles || {}, theme);

		console.log('[UIRendererService] Rendering node with styles', {
			nodeType: node.type,
			nodeId: node.id,
			hasStyles: !!node.styles,
			stylesKeys: node.styles ? Object.keys(node.styles) : [],
			builtStyleKeys: Object.keys(style),
			style: style,
			props: node.props
		});

		// Handle onClick action
		const handleClick = this._createClickHandler(node, context);
		
		// Handle onChange action for inputs
		const handleChange = this._createChangeHandler(node, context);

		// Recursively render children
		const children = this._renderChildren(node, theme, context, depth);

		// Build component props
		const componentProps: Record<string, unknown> = {
			...node.props,
			className,
			style,
			children,
			onClick: handleClick,
			onChange: handleChange,
			isLoading: context?.isLoading || false
		};

		console.log('[UIRendererService] Component props for', node.type, {
			...componentProps,
			style: componentProps.style
		});

		// Special handling for UniversalContainer
		if (node.type === 'Container') {
			const isVertical = node.styles?.flexDirection === 'column';
			const isSidebar = node.id.includes('sidebar') || node.id.includes('Sidebar');
			console.log(`[UIRendererService] Container ${node.id} - isVertical: ${isVertical}, flexDirection: ${node.styles?.flexDirection}, isSidebar: ${isSidebar}`);
			componentProps.vertical = isVertical;
			componentProps.sidebar = isSidebar;
			
			// Extract gap from style if present
			if (style.gap) {
				componentProps.gap = style.gap;
			}
		}

		// Special handling for UniversalVideo - map src to url
		if (node.type === 'Video') {
			if (componentProps.src && !componentProps.url) {
				componentProps.url = componentProps.src;
				delete componentProps.src;
			}
		}

		try {
			return createElement(Component, componentProps as never);
		} catch (error) {
			this._logger.error('[UIRendererService] Error rendering component', {
				type: node.type,
				nodeId: node.id,
				error
			});
			return createElement('div', { className: 'error-fallback' }, `Error rendering ${node.type}`);
		}
	}

	private _createClickHandler(
		node: ComponentNode,
		context: ActionContext | undefined
	): (() => void) | undefined {
		if (!node.actions?.onClick || !context) {
			return undefined;
		}

		return (): void => {
			this._actionHandler.handleAction(node.actions!.onClick!, context);
		};
	}

	private _createChangeHandler(
		node: ComponentNode,
		context: ActionContext | undefined
	): ((value: string | number) => void) | undefined {
		if (!node.actions?.onChange || !context) {
			return undefined;
		}

		return (value: string | number): void => {
			this._actionHandler.handleAction(node.actions!.onChange!, context, value);
		};
	}

	private _renderChildren(
		node: ComponentNode,
		theme: ThemeConfig,
		context: ActionContext | undefined,
		depth: number
	): JSX.Element[] | undefined {
		if (!node.children || node.children.length === 0) {
			return undefined;
		}

		return node.children
			.map((child, index) => {
				const element = this._renderNode(child, theme, context, depth + 1);
				if (!element) {
					return null;
				}
				// Add key prop using child.id or fallback to index
				const key = child.id || `child-${depth}-${index}`;
				return cloneElement(element, { key });
			})
			.filter((element): element is JSX.Element => element !== null);
	}
}




