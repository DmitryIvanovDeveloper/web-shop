

import type { ComponentNode } from '../component-node';
import type { StyleConfig } from '../style-config';
import type { ActionsConfig } from '../actions-config';
import { UIComponents } from '../component-types';

export class UIBuilder {
	private _rootNode: ComponentNode | null = null;
	private _lastAddedNode: ComponentNode | null = null;

	public container(props?: { readonly vertical?: boolean; readonly sidebar?: boolean }): UIBuilder {
		const node: ComponentNode = {
			id: this._generateId('container'),
			type: UIComponents.Container,
			props: props ?? {},
			children: []
		};

		if (!this._rootNode) {
			this._rootNode = node;
		}
		
		this._lastAddedNode = node;
		
		return this;
	}

	public grid(props?: { readonly columns?: number; readonly gap?: number }): UIBuilder {
		const node: ComponentNode = {
			id: this._generateId('grid'),
			type: UIComponents.Grid,
			props: props ?? {},
			children: []
		};

		this._addChildToRoot(node);
		this._lastAddedNode = node;
		
		return this;
	}

	public dataGrid(props?: { readonly dataSource?: string; readonly columns?: number }): UIBuilder {
		const node: ComponentNode = {
			id: this._generateId('data-grid'),
			type: UIComponents.DataGrid,
			props: props ?? {},
			children: []
		};

		this._addChildToRoot(node);
		this._lastAddedNode = node;
		
		return this;
	}

	public button(props: { readonly text: string; readonly icon?: string }): UIBuilder {
		const node: ComponentNode = {
			id: this._generateId('button'),
			type: UIComponents.Button,
			props
		};

		this._addChildToRoot(node);
		this._lastAddedNode = node;
		
		return this;
	}

	public text(props: { readonly text: string }): UIBuilder {
		const node: ComponentNode = {
			id: this._generateId('text'),
			type: UIComponents.Text,
			props
		};

		this._addChildToRoot(node);
		this._lastAddedNode = node;
		
		return this;
	}

	public input(props: { readonly placeholder?: string; readonly value?: string }): UIBuilder {
		const node: ComponentNode = {
			id: this._generateId('input'),
			type: UIComponents.Input,
			props
		};

		this._addChildToRoot(node);
		this._lastAddedNode = node;
		
		return this;
	}

	public withStyles(styles: StyleConfig): UIBuilder {
		if (!this._lastAddedNode) {
			throw new Error('No current node to apply styles');
		}

		this._lastAddedNode = {
			...this._lastAddedNode,
			styles
		};

		this._updateNodeInTree(this._lastAddedNode);

		return this;
	}

	public withActions(actions: ActionsConfig): UIBuilder {
		if (!this._lastAddedNode) {
			throw new Error('No current node to apply actions');
		}

		this._lastAddedNode = {
			...this._lastAddedNode,
			actions
		};

		this._updateNodeInTree(this._lastAddedNode);

		return this;
	}

	public addChild(child: ComponentNode): UIBuilder {
		this._addChildToRoot(child);
		return this;
	}

	public build(): ComponentNode {
		if (!this._rootNode) {
			throw new Error('No nodes to build');
		}

		return this._rootNode;
	}

	private _addChildToRoot(node: ComponentNode): void {
		if (!this._rootNode) {
			this._rootNode = node;
			return;
		}

		const children = [...(this._rootNode.children ?? []), node];
		this._rootNode = {
			...this._rootNode,
			children
		};
	}

	private _updateNodeInTree(updatedNode: ComponentNode): void {
		if (!this._rootNode) {
			return;
		}

		if (this._rootNode.id === updatedNode.id) {
			this._rootNode = updatedNode;
			return;
		}

		this._rootNode = this._updateNodeRecursive(this._rootNode, updatedNode);
	}

	private _updateNodeRecursive(node: ComponentNode, updatedNode: ComponentNode): ComponentNode {
		if (node.id === updatedNode.id) {
			return updatedNode;
		}

		if (node.children == null || node.children.length === 0) {
			return node;
		}

		const children = node.children.map(child => 
			this._updateNodeRecursive(child, updatedNode)
		);

		return {
			...node,
			children
		};
	}

	private _generateId(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	}
}

