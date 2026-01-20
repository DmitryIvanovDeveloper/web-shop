

import { injectable, inject } from 'inversify';
import { createElement, cloneElement } from 'react';
import type { ComponentType, MouseEvent } from 'react';
import type { UIRendererPort } from '../../../application/ports/ui-renderer.port';
import type { UIDescriptor } from '../../../shared/ui/ui-descriptor';
import type { ComponentNode } from '../../../shared/ui/component-node';
import type { ThemeConfig } from '../../../shared/ui/theme-config';
import type { ActionContext } from '../../../shared/ui/action-context';
import { UIComponentRegistry } from './component-registry.service';
import { UIStyleBuilder } from './style-builder.service';
import { UIActionHandler } from './action-handler.service';
import { selectionOverlay } from './selection-overlay.service';
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
	) {
		if (typeof window !== 'undefined') {
			this._setupSelectionListener();
		}
	}

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

		const className = this._styleBuilder.buildClassName(node.styles || {}, theme);
		const style = this._styleBuilder.buildInlineStyles(node.styles || {}, theme);

		if (node.type === 'Text') {
			this._logger.info('[UIRendererService] Text component styles:', {
				nodeId: node.id,
				textColor: node.styles?.textColor,
				fontSize: node.styles?.fontSize,
				fontWeight: node.styles?.fontWeight,
				allStyles: JSON.stringify(node.styles || {}),
				builtColor: style.color,
				builtFontSize: style.fontSize,
				builtFontWeight: style.fontWeight
			});
		}

		console.log('[UIRendererService] Rendering node with styles', {
			nodeType: node.type,
			nodeId: node.id,
			hasStyles: !!node.styles,
			stylesKeys: node.styles ? Object.keys(node.styles) : [],
			builtStyleKeys: Object.keys(style),
			style: style,
			props: node.props
		});

		let buttonActions = node.actions;
		if (node.type === 'Button' && node.props?.pageSlug && typeof node.props.pageSlug === 'string' && !node.actions?.onClick) {
			buttonActions = {
				...node.actions,
				onClick: {
					type: 'navigate',
					url: `/${node.props.pageSlug}`
				}
			};
		}

		const nodeWithActions = buttonActions ? { ...node, actions: buttonActions } : node;
		const handleClick = this._createClickHandler(nodeWithActions, context);

		const { pageSlug, ...propsWithoutPageSlug } = node.props || {};

		const handleChange = this._createChangeHandler(node, context);

		let selectProps = propsWithoutPageSlug;
		if (node.type === 'Select' && context?.availableLanguages) {
			selectProps = {
				...propsWithoutPageSlug,
				options: context.availableLanguages
			};
		}

		const hoverHandlers = this._createHoverHandlers(node);

		const buttonHoverHandlers = this._createButtonHoverHandlers(node, style);

		const previewProps = this._isPreviewMode() && node.id ? { 'data-element-id': node.id } : {};

		const children = this._renderChildren(node, theme, context, depth);

		const componentProps: Record<string, unknown> = {
			...selectProps,
			...previewProps,
			className,
			style,
			children,
			onClick: handleClick,
			onChange: handleChange,
			...hoverHandlers,
			...buttonHoverHandlers
		};

		if (node.type === 'Button') {
			componentProps.isLoading = context?.isLoading || false;

			if (node.styles?.iconSize) {
				componentProps.iconSize = node.styles.iconSize;
			}
			if (node.styles?.iconGap) {
				componentProps.iconGap = node.styles.iconGap;
			}
		}

		if (node.type === 'Container') {
			const isVertical = node.styles?.flexDirection === 'column';
			const isSidebar = node.id.includes('sidebar') || node.id.includes('Sidebar');
			componentProps.vertical = isVertical;
			componentProps.sidebar = isSidebar;

			if (style.gap) {
				componentProps.gap = style.gap;
			}
		}

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

	private _isPreviewMode(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}
		const params = new URLSearchParams(window.location.search);
		const previewParam = params.get('previewMode') === 'true';
		const uiBuilderParam = params.get('uibuilder') === 'true';
		return previewParam || uiBuilderParam;
	}

	private _isElementSelectionMode(): boolean {
		if (typeof document !== 'undefined' && document.body) {
			return document.body.getAttribute('data-selection-mode') === 'true';
		}
		if (typeof window !== 'undefined') {
			return (window as any).__elementSelectionMode === true;
		}
		return false;
	}

	private _setupSelectionListener(): void {
		const globalFlag = '__uiRendererSelectionListenerInitialized';
		if ((window as any)[globalFlag]) {
			return;
		}
		(window as any)[globalFlag] = true;

		window.addEventListener('message', (event: MessageEvent) => {
			if (!event.data || event.data.type !== 'SELECT_ELEMENT') {
				return;
			}

			const elementId = event.data.payload?.elementId || event.data.elementId || null;
			this._logger.info('[UIRendererService] SELECT_ELEMENT received', { elementId });

			if (typeof document === 'undefined') {
				return;
			}

			if (!elementId) {
				selectionOverlay.hide();
				return;
			}

			const targetElement = document.querySelector(
				`[data-element-id="${elementId}"]`
			) as HTMLElement | null;

			if (targetElement) {
				const rect = targetElement.getBoundingClientRect();
				selectionOverlay.show({
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height,
				}, elementId, true); this._logger.info('[UIRendererService] Updated selection overlay for element', {
					elementId,
					rect,
					isSelected: true
				});
			} else {
				selectionOverlay.hide();
				this._logger.warn('[UIRendererService] SELECT_ELEMENT: element not found', {
					elementId,
				});
			}
		});
	}

	private _createHoverHandlers(node: ComponentNode): Record<string, unknown> {
		if (typeof window === 'undefined') {
			return {};
		}

		const isSelectionModeActive = this._isPreviewMode() && this._isElementSelectionMode() && node.id;

		if (!isSelectionModeActive) {
			return {};
		}

		const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
			if (this._isPreviewMode() && this._isElementSelectionMode() && node.id) {
				const target = e.currentTarget;
				const eventTarget = e.target as HTMLElement;

				if (eventTarget !== target) {
					const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
					if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
						const childId = childWithId.getAttribute('data-element-id');
						if (childId && childId !== node.id) {
							this._logger.info(`[UIRendererService] Skipping hover on parent ${node.id} - child ${childId} is being hovered`);
							return;
						}
					}
				}

				if (typeof document !== 'undefined') {
					const childElements = target.querySelectorAll('[data-element-id]');
					childElements.forEach((child) => {
						const childEl = child as HTMLElement;
						if (childEl !== target && childEl.hasAttribute('data-element-id')) {
							const childId = childEl.getAttribute('data-element-id');
							if (childId && childId !== node.id) {
								selectionOverlay.hide(childId);
								childEl.classList.remove('preview-hover');
							}
						}
					});
				}

				if (!target.classList.contains('preview-hover')) {
					target.classList.add('preview-hover');
				}

				const rect = target.getBoundingClientRect();
				selectionOverlay.show({
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height
				}, node.id, false);
				this._logger.info(`[UIRendererService] Applied preview-hover class and overlay to: ${node.id}`);
			}
		};

		const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
			if (this._isPreviewMode() && this._isElementSelectionMode() && node.id) {
				const target = e.currentTarget;
				target.classList.remove('preview-hover');

				selectionOverlay.hide(node.id);

				this._logger.info(`[UIRendererService] Removed preview-hover class and overlay from: ${node.id}`);
			}
		};

		return {
			onMouseEnter: handleMouseEnter,
			onMouseLeave: handleMouseLeave
		};
	}


	private _createButtonHoverHandlers(node: any, style: React.CSSProperties): Record<string, unknown> {
		const hasHoverProperties = style &&
			(('--hover-background-color' in style) ||
				('--hover-opacity' in style) ||
				('--hover-shadow' in style));

		if (!hasHoverProperties) {
			return {};
		}

		const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
			const target = e.currentTarget;

			const originalStyles = {
				backgroundColor: target.style.backgroundColor,
				opacity: target.style.opacity,
				boxShadow: target.style.boxShadow
			};
			(target as any)._originalStyles = originalStyles;

			const hoverStyle = style as any;
			if (hoverStyle['--hover-background-color']) {
				target.style.backgroundColor = hoverStyle['--hover-background-color'] as string;
			}
			if (hoverStyle['--hover-opacity'] !== undefined) {
				target.style.opacity = hoverStyle['--hover-opacity'] as string;
			}
			if (hoverStyle['--hover-shadow']) {
				target.style.boxShadow = hoverStyle['--hover-shadow'] as string;
			}
		};

		const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
			const target = e.currentTarget;
			const originalStyles = (target as any)._originalStyles;

			if (originalStyles) {
				target.style.backgroundColor = originalStyles.backgroundColor;
				target.style.opacity = originalStyles.opacity;
				target.style.boxShadow = originalStyles.boxShadow;
			}
		};

		return {
			onMouseEnter: handleMouseEnter,
			onMouseLeave: handleMouseLeave
		};
	}

	private _createClickHandler(
		node: ComponentNode,
		context: ActionContext | undefined
	): ((e?: React.MouseEvent<HTMLElement>) => void) | undefined {
		const isPreviewMode = this._isPreviewMode();
		const isElementSelectionMode = this._isElementSelectionMode();
		const hasNodeId = !!node.id;

		this._logger.info(`[UIRendererService] _createClickHandler for node ${node.id}:`, {
			isPreviewMode,
			isElementSelectionMode,
			hasNodeId,
			nodeType: node.type
		});

		if (isPreviewMode && isElementSelectionMode && hasNodeId) {
			return (e?: React.MouseEvent<HTMLElement>) => {
				this._logger.info(`[UIRendererService] Click handler called for node ${node.id}`, {
					nodeId: node.id,
					nodeType: node.type,
					hasEvent: !!e,
					target: e?.target,
					currentTarget: e?.currentTarget
				});

				if (e && node.type === 'Container') {
					const target = e.target as HTMLElement;
					const currentTarget = e.currentTarget as HTMLElement;

					if (target !== currentTarget) {
						const childElementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');
						if (childElementId && childElementId !== node.id) {
							this._logger.info(`[UIRendererService] Click was on child element ${childElementId}, not handling container ${node.id} click`);
							return;
						}
					}
				}

				if (e) {
					e.preventDefault();
					e.stopPropagation();
				}

				if (typeof document !== 'undefined') {
					const allElements = document.querySelectorAll('[data-element-id]');
					this._logger.info(`[UIRendererService] Removing outline from ${allElements.length} elements after click`);
					allElements.forEach((el) => {
						const htmlEl = el as HTMLElement;
						const mouseLeaveEvent = new MouseEvent('mouseleave', {
							bubbles: true,
							cancelable: true,
							view: window
						});
						htmlEl.dispatchEvent(mouseLeaveEvent);
						htmlEl.classList.remove('preview-hover');
						htmlEl.style.removeProperty('cursor');
						htmlEl.style.removeProperty('outline');
						htmlEl.style.removeProperty('outline-offset');
						htmlEl.style.removeProperty('box-shadow');
						htmlEl.style.removeProperty('overflow');
						htmlEl.style.removeProperty('border');
					});
					this._logger.info(`[UIRendererService] Outline removed from all elements`);
				}

				this._logger.info(`[UIRendererService] Element clicked in selection mode: ${node.id}`);

				let elementIdToSend = node.id;
				if (e?.currentTarget) {
					const dataElementId = (e.currentTarget as HTMLElement).getAttribute('data-element-id');
					if (dataElementId && dataElementId !== node.id) {
						this._logger.info(`[UIRendererService] Element has different data-element-id:`, {
							nodeId: node.id,
							dataElementId,
							using: dataElementId
						});
						elementIdToSend = dataElementId;
					}
				}

				if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
					// Use '*' as default origin for postMessage (allows communication with any origin)
					// In production, this should be set to the specific builder URL for security
					const builderOrigin = '*';
					this._logger.info(`[UIRendererService] Sending ELEMENT_SELECTED to parent:`, {
						elementId: elementIdToSend,
						nodeId: node.id,
						origin: builderOrigin
					});

					if (window.parent && typeof window.parent.postMessage === 'function') {
						try {
							window.parent.postMessage(
								{ type: 'ELEMENT_SELECTED', elementId: elementIdToSend },
								builderOrigin
							);
						} catch (error) {
							this._logger.warn('[UIRendererService] Failed to send ELEMENT_SELECTED message to parent:', error);
						}
					} else {
						this._logger.warn('[UIRendererService] Parent window not available for ELEMENT_SELECTED message');
					}
				} else {
					this._logger.warn('[UIRendererService] No parent window or same window');
				}
			};
		}

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
		if (this._isPreviewMode() && this._isElementSelectionMode()) {
			return undefined;
		}

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
				const key = child.id || `child-${depth}-${index}`;
				return cloneElement(element, { key });
			})
			.filter((element): element is JSX.Element => element !== null);
	}
}




