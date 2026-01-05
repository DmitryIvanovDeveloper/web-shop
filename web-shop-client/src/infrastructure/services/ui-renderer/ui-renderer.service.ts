/**
 * UI Renderer Service - универсальный сервис рендеринга UI
 * Infrastructure Service - НЕ модуль!
 * 
 * Принимает UIDescriptor от модулей и возвращает JSX.Element
 * НЕ владеет данными, НЕ загружает конфигурацию
 */

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
		// Setup global selection listener once in browser environment
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

		// Build styles
		const className = this._styleBuilder.buildClassName(node.styles || {}, theme);
		const style = this._styleBuilder.buildInlineStyles(node.styles || {}, theme);
		
		// Debug logging for Text component styles
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

		// For Button with pageSlug, create navigate action if not already set
		let buttonActions = node.actions;
		if (node.type === 'Button' && node.props?.pageSlug && typeof node.props.pageSlug === 'string' && !node.actions?.onClick) {
			buttonActions = {
				...node.actions,
				onClick: {
					type: 'navigate',
					url: `/${node.props.pageSlug}`
				}
			};
			console.log('[UIRendererService] Created navigate action from pageSlug', {
				nodeId: node.id,
				pageSlug: node.props.pageSlug,
				url: `/${node.props.pageSlug}`
			});
		}

		// Handle onClick action (use buttonActions if it was set for pageSlug navigation)
		const nodeWithActions = buttonActions ? { ...node, actions: buttonActions } : node;
		const handleClick = this._createClickHandler(nodeWithActions, context);
		
		// Exclude pageSlug from props passed to DOM (it's only used for action creation)
		const { pageSlug, ...propsWithoutPageSlug } = node.props || {};
		
		// Handle onChange action for inputs
		const handleChange = this._createChangeHandler(node, context);

		// Special handling for Select component - inject options from actionContext
		let selectProps = propsWithoutPageSlug;
		if (node.type === 'Select' && context?.availableLanguages) {
			selectProps = {
				...propsWithoutPageSlug,
				options: context.availableLanguages
			};
			console.log('[UIRendererService] Injected languages into Select component', {
				nodeId: node.id,
				languagesCount: context.availableLanguages.length
			});
		}

		// Add hover handlers for element selection mode (preview mode)
		const hoverHandlers = this._createHoverHandlers(node);

		// Add data-element-id for preview mode to enable selection and hover effects
		const previewProps = this._isPreviewMode() && node.id ? { 'data-element-id': node.id } : {};

		// Recursively render children
		const children = this._renderChildren(node, theme, context, depth);

		// Build component props
		const componentProps: Record<string, unknown> = {
			...selectProps,
			...previewProps,
			className,
			style,
			children,
			onClick: handleClick,
			onChange: handleChange,
			...hoverHandlers
		};

		// Only add isLoading for Button components (not to DOM elements)
		if (node.type === 'Button') {
			componentProps.isLoading = context?.isLoading || false;
		}

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
		// Avoid registering multiple times
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

			// If elementId is null/undefined – hide overlay
			if (!elementId) {
				selectionOverlay.hide();
				return;
			}

			// Find target element by data-element-id
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
				}, elementId, true); // isSelected = true
				this._logger.info('[UIRendererService] Updated selection overlay for element', {
					elementId,
					rect,
					isSelected: true
				});
			} else {
				// If element not found, hide overlay to avoid stale highlight
				selectionOverlay.hide();
				this._logger.warn('[UIRendererService] SELECT_ELEMENT: element not found', {
					elementId,
				});
			}
		});
	}

	private _createHoverHandlers(node: ComponentNode): Record<string, unknown> {
		// Check if in preview mode and element selection mode
		if (typeof window === 'undefined') {
			return {};
		}

		const isSelectionModeActive = this._isPreviewMode() && this._isElementSelectionMode() && node.id;

		if (!isSelectionModeActive) {
			return {};
		}

		// Create hover handlers using DOM manipulation (since we can't use React hooks in service)
		const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
			if (this._isPreviewMode() && this._isElementSelectionMode() && node.id) {
				const target = e.currentTarget;
				const eventTarget = e.target as HTMLElement;
				
				// Check if the cursor is actually over this element, not a child element with data-element-id
				// If a child element with data-element-id is being hovered, don't highlight the parent
				if (eventTarget !== target) {
					const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
					if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
						const childId = childWithId.getAttribute('data-element-id');
						if (childId && childId !== node.id) {
							// A child element with data-element-id is being hovered, don't highlight parent
							this._logger.info(`[UIRendererService] Skipping hover on parent ${node.id} - child ${childId} is being hovered`);
							return;
						}
					}
				}
				
				// Before showing spotlight for parent, hide any child element spotlights
				// This ensures smooth transition when moving cursor from child to parent
				if (typeof document !== 'undefined') {
					const childElements = target.querySelectorAll('[data-element-id]');
					childElements.forEach((child) => {
						const childEl = child as HTMLElement;
						if (childEl !== target && childEl.hasAttribute('data-element-id')) {
							const childId = childEl.getAttribute('data-element-id');
							if (childId && childId !== node.id) {
								// Hide spotlight for child element if it was showing
								selectionOverlay.hide(childId);
								childEl.classList.remove('preview-hover');
							}
						}
					});
				}
				
				if (!target.classList.contains('preview-hover')) {
					target.classList.add('preview-hover');
				}
				
				// Show overlay on hover - this will automatically replace any previous hover overlay
				const rect = target.getBoundingClientRect();
				selectionOverlay.show({
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height
				}, node.id, false); // isSelected = false for hover
				
				this._logger.info(`[UIRendererService] Applied preview-hover class and overlay to: ${node.id}`);
				// Don't stop propagation - allow hover to work on other elements
			}
		};

		const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
			if (this._isPreviewMode() && this._isElementSelectionMode() && node.id) {
				const target = e.currentTarget;
				target.classList.remove('preview-hover');
				
				// Hide overlay on mouse leave (only if not selected)
				// We can't check if it's selected here, so we pass elementId to hide()
				// hide() will check internally if it's selected
				selectionOverlay.hide(node.id);
				
				this._logger.info(`[UIRendererService] Removed preview-hover class and overlay from: ${node.id}`);
				// Don't stop propagation - allow hover to work on other elements
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
		// In element selection mode, send element selection message to parent window
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
				
				// For containers, check if click was on the container itself or a child
				// If click was on a child with its own data-element-id, don't handle it here
				if (e && node.type === 'Container') {
					const target = e.target as HTMLElement;
					const currentTarget = e.currentTarget as HTMLElement;
					
					// Check if click was on a child element with its own data-element-id
					if (target !== currentTarget) {
						const childElementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');
						if (childElementId && childElementId !== node.id) {
							this._logger.info(`[UIRendererService] Click was on child element ${childElementId}, not handling container ${node.id} click`);
							return; // Let the child element handle the click
						}
					}
				}
				
				// Prevent default behavior
				if (e) {
					e.preventDefault();
					e.stopPropagation();
				}
				
				// Remove outline from all elements when clicking
				// Trigger mouseleave event on all elements to ensure hover handlers are called
				if (typeof document !== 'undefined') {
					const allElements = document.querySelectorAll('[data-element-id]');
					this._logger.info(`[UIRendererService] Removing outline from ${allElements.length} elements after click`);
					allElements.forEach((el) => {
						const htmlEl = el as HTMLElement;
						// Trigger mouseleave event to ensure hover handlers clean up
						const mouseLeaveEvent = new MouseEvent('mouseleave', {
							bubbles: true,
							cancelable: true,
							view: window
						});
						htmlEl.dispatchEvent(mouseLeaveEvent);
						// Also manually remove styles as fallback
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
				
				// Also check if element has data-element-id attribute that might differ from node.id
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
					const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL || '*';
					this._logger.info(`[UIRendererService] Sending ELEMENT_SELECTED to parent:`, {
						elementId: elementIdToSend,
						nodeId: node.id,
						origin: builderOrigin
					});
					
					// Check if parent window still exists before sending message
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
		// Disable change handlers in element selection mode
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
				// Add key prop using child.id or fallback to index
				const key = child.id || `child-${depth}-${index}`;
				return cloneElement(element, { key });
			})
			.filter((element): element is JSX.Element => element !== null);
	}
}




