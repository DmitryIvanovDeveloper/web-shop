/**
 * UI Renderer Port - интерфейс универсального сервиса рендеринга
 * Модули зависят от этого интерфейса, НЕ от реализации
 */

import type { ComponentNode } from '../../shared/ui/component-node';
import type { ThemeConfig } from '../../shared/ui/theme-config';
import type { ActionContext } from '../../shared/ui/action-context';
import type { UIDescriptor } from '../../shared/ui/ui-descriptor';
import type { ComponentType } from 'react';

export interface UIRendererPort {
	/**
	 * Render UI from descriptor
	 * @param descriptor - UI description (layout + theme + context)
	 * @returns React element
	 */
	renderUI(descriptor: UIDescriptor): JSX.Element | null;
	
	/**
	 * Register custom component
	 * @param type - component type identifier
	 * @param component - React component
	 */
	registerComponent(type: string, component: ComponentType<unknown>): void;
	
	/**
	 * Check if component is registered
	 * @param type - component type identifier
	 * @returns true if component exists
	 */
	hasComponent(type: string): boolean;
}


