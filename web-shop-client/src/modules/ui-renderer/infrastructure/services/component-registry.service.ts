import { injectable } from 'inversify';
import type { ComponentType } from 'react';
import { UniversalButton } from '../../../../../src/shared/components/atoms/button';
import { UniversalContainer } from '../../../../../src/shared/components/atoms/container';
import { Badge } from '../../../../../src/shared/components/atoms/badge';
import { UniversalImage } from '../../../../../src/shared/components/atoms/image';
import { UniversalText } from '../../../../../src/shared/components/atoms/text';
import { UniversalInput } from '../../../../../src/shared/components/molecules/universal-input';
import { Input } from '../../../../../src/shared/components/atoms/input';
import { Grid } from '../../../../../src/shared/components/molecules/grid';
import { DataGrid } from '../../../../../src/shared/components/molecules/data-grid';
import { OfferCard } from '../../../../../src/shared/components/molecules/offer-card';
import { Popup } from '../../../../../src/shared/components/molecules/popup';
import { OffersList } from '../../../offers/interface-adapters/ui/components/offers-list';
import { ProductsList } from '../../../products/interface-adapters/ui/components/products-list';

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
    this._components.set('UniversalInput', UniversalInput);
    this._components.set('Input', Input);
    this._components.set('Grid', Grid);
    this._components.set('DataGrid', DataGrid);
    this._components.set('OfferCard', OfferCard);
    this._components.set('OffersList', OffersList);
    this._components.set('ProductsList', ProductsList);
    this._components.set('Popup', Popup);
  }

  public register(type: string, component: ComponentType<any>): void {
    this._components.set(type, component);
  }

  public getComponent(type: string): ComponentType<any> | null {
    return this._components.get(type) || null;
  }
}

