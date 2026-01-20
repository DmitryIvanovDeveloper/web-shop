

import type { StyleConfig } from './style-config';
import type { ActionsConfig } from './actions-config';

export interface ComponentNode {
	readonly id: string;
	readonly type: string;
	readonly props: Readonly<Record<string, unknown>>;
	readonly styles?: Readonly<StyleConfig>;
	readonly children?: readonly ComponentNode[];
	readonly actions?: Readonly<ActionsConfig>;
}


