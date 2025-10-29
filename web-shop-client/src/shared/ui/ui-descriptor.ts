/**
 * UIDescriptor - контракт между модулями и UI Renderer Service
 * Модуль создаёт UIDescriptor и передаёт в сервис для рендеринга
 */

import type { ComponentNode } from './component-node';
import type { ThemeConfig } from './theme-config';
import type { ActionContext } from './action-context';

export interface UIDescriptor {
	readonly layout: ComponentNode;
	readonly theme: ThemeConfig;
	readonly context?: ActionContext;
}


