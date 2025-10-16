import { injectable } from 'inversify';
import type { ComponentType } from 'react';
import { UniversalButton } from '../../../../../src/shared/components/atoms/button';
import { UniversalContainer } from '../../../../../src/shared/components/atoms/container';
import { Badge } from '../../../../../src/shared/components/atoms/badge';
import { UniversalImage } from '../../../../../src/shared/components/atoms/image';
import { UniversalText } from '../../../../../src/shared/components/atoms/text';
import { Grid } from '../../../../../src/shared/components/molecules/grid';
import { DataGrid } from '../../../../../src/shared/components/molecules/data-grid';
import { OfferCard } from '../../../../../src/shared/components/molecules/offer-card';

@injectable()
export class ComponentRegistry {
  private readonly _components: Map<string, ComponentType<any>> = new Map();

  constructor() {
    this._registerComponents();
  }

  private _registerComponents(): void {
    this._components.set('Button', UniversalButton);
    this._components.set('Container', UniversalContainer);
    this._components.set('Badge', Badge);
    this._components.set('Image', UniversalImage);
    this._components.set('Text', UniversalText);
    this._components.set('Grid', Grid);
    this._components.set('DataGrid', DataGrid);
    this._components.set('OfferCard', OfferCard);
  }

  public register(type: string, component: ComponentType<any>): void {
    this._components.set(type, component);
  }

  public getComponent(type: string): ComponentType<any> | null {
    return this._components.get(type) || null;
  }
}

