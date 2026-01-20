

import { injectable } from 'inversify';
import type { ComponentType } from 'react';

import { UniversalContainer } from '../../../shared/components/atoms/container';
import { UniversalButton } from '../../../shared/components/atoms/button';
import { UniversalText } from '../../../shared/components/atoms/text';
import { Input } from '../../../shared/components/atoms/input';
import { Select } from '../../../shared/components/atoms/select';
import { UniversalImage } from '../../../shared/components/atoms/image';
import { UniversalVideo } from '../../../shared/components/atoms/video';
import { Badge } from '../../../shared/components/atoms/badge';
import { Grid } from '../../../shared/components/molecules/grid';
import { DataGrid } from '../../../shared/components/molecules/data-grid';
import { UniversalInput } from '../../../shared/components/molecules/universal-input';
import { OfferCard } from '../../../shared/components/molecules/offer-card';
import { Popup } from '../../../shared/components/molecules/popup';

@injectable()
export class UIComponentRegistry {
	private readonly _components: Map<string, ComponentType<any>>;

	constructor() {
		this._components = new Map();
		this._registerDefaultComponents();
	}

	
	public register(type: string, component: ComponentType<any>): void {
		this._components.set(type, component);
	}

	
	public registerComponent(type: string, component: ComponentType<any>): void {
		this.register(type, component);
	}

	
	public getComponent(type: string): ComponentType<any> | null {
		return this._components.get(type) || null;
	}

	
	public hasComponent(type: string): boolean {
		return this._components.has(type);
	}

	
	public getRegisteredTypes(): string[] {
		return Array.from(this._components.keys());
	}

	
	private _registerDefaultComponents(): void {
				this.registerComponent('Container', UniversalContainer);
		this.registerComponent('Button', UniversalButton);
		this.registerComponent('Text', UniversalText);
		this.registerComponent('Input', Input);
		this.registerComponent('Select', Select);
		this.registerComponent('Image', UniversalImage);
		this.registerComponent('Video', UniversalVideo);
		this.registerComponent('Badge', Badge);

				this.registerComponent('Grid', Grid);
		this.registerComponent('DataGrid', DataGrid);
		this.registerComponent('UniversalInput', UniversalInput);
		this.registerComponent('OfferCard', OfferCard);
		this.registerComponent('Popup', Popup);
	}
}
