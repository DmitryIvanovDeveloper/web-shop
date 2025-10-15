import { injectable } from 'inversify';
import type { ComponentType } from 'react';
import { UniversalButton, UniversalContainer } from '@components';
import type { UniversalButtonProps, UniversalContainerProps } from '@components';

@injectable()
export class ComponentRegistry {
  private readonly _components: Map<string, ComponentType<UniversalButtonProps | UniversalContainerProps>> = new Map();

  constructor() {
    this._components.set('Button', UniversalButton);
    this._components.set('Container', UniversalContainer);
  }

  public register(
    type: string,
    component: ComponentType<UniversalButtonProps | UniversalContainerProps>
  ): void {
    this._components.set(type, component);
  }

  public getComponent(
    type: string
  ): ComponentType<UniversalButtonProps | UniversalContainerProps> | null {
    return this._components.get(type) || null;
  }
}

