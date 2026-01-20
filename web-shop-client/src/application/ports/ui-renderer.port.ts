

import type { ComponentNode } from '../../shared/ui/component-node';
import type { ThemeConfig } from '../../shared/ui/theme-config';
import type { ActionContext } from '../../shared/ui/action-context';
import type { UIDescriptor } from '../../shared/ui/ui-descriptor';
import type { ComponentType } from 'react';

export interface UIRendererPort {
	
	renderUI(descriptor: UIDescriptor): JSX.Element | null;
	
	
	registerComponent(type: string, component: ComponentType<unknown>): void;
	
	
	hasComponent(type: string): boolean;
}


